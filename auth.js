import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

// Auth.js v5 — Discord OAuth with JWT sessions (no DB adapter needed: the
// Discord id from the token is all we use, and per-user data lives in KV).
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
  ],
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.discordId = profile.id;
        token.discord_profile = profile;
        token.picture = profile.image_url || token.picture;
        token.name = profile.global_name || profile.username || token.name;
      }
      return token;
    },
    session({ session, token }) {
      session.userId = token.discordId;
      session.discordId = token.discordId;
      if (session.user) {
        session.user.id = token.discordId;
        session.user.discord_profile = token.discord_profile;
      }
      return session;
    },
  },
});
