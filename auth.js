import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyPassword } from "./libs/password";

export const userKey = (username) => `user:${String(username).toLowerCase().trim()}`;

// Auth.js v5 — Discord OAuth + username/password (Credentials), JWT sessions.
// Per-user data lives in KV; we only need a stable id (`session.uid`):
//   Discord     -> the Discord user id      (cfg:<discordId>)
//   Credentials -> `u:<username>`           (cfg:u:<username>)
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      profile(profile) {
        if (profile.avatar === null) {
          const n = parseInt(profile.discriminator || "0", 10) % 5;
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${n}.png`;
        } else {
          const format = profile.avatar.startsWith("a_") ? "gif" : "png";
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }
        return {
          id: profile.id,
          name: profile.global_name || profile.username,
          email: profile.email,
          image: profile.image_url,
          discord_profile: profile,
        };
      },
    }),
    Credentials({
      credentials: { username: {}, password: {} },
      async authorize(creds) {
        const username = String(creds?.username || "").toLowerCase().trim();
        const password = String(creds?.password || "");
        if (!username || !password) return null;
        const { env } = getCloudflareContext();
        const rec = await env.CONFIG_KV.get(userKey(username), "json");
        if (!rec?.hash) return null;
        const ok = await verifyPassword(password, rec.salt, rec.hash);
        if (!ok) return null;
        // rec.uid lets a username attached to a Discord account resolve to the
        // same uid (and thus the same cloud data).
        return { id: rec.uid || `u:${username}`, name: username };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, account, profile }) {
      if (account?.provider === "discord" && profile) {
        token.uid = profile.id;
        token.discord_profile = profile;
        token.picture = profile.image_url || token.picture;
        token.name = profile.global_name || profile.username || token.name;
      } else if (account?.provider === "credentials" && user) {
        token.uid = user.id; // "u:<username>"
        token.name = user.name;
        token.picture = null;
        token.discord_profile = undefined;
      }
      return token;
    },
    session({ session, token }) {
      session.uid = token.uid;
      session.discordId = token.discord_profile ? token.discord_profile.id : undefined;
      if (session.user) {
        session.user.id = token.uid;
        session.user.name = token.name;
        session.user.image = token.picture || null;
        session.user.discord_profile = token.discord_profile;
      }
      return session;
    },
  },
});
