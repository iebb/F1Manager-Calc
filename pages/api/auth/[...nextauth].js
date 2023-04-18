import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "../../../libs/cloud/mongodb"
export const authOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.AUTH_DATABASE_NAME,
  }),
  // Configure one or more authentication providers
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      profile(profile) {
        if (profile.avatar === null) {
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
        } else {
          const format = profile.avatar.startsWith("a_") ? "gif" : "png"
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`
        }
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.image_url,
          discord_profile: profile,
        }
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.userId = user.id
      session.user = user

      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      if(user) {
        account.discord_profile = profile;
      }
      return true;
    },
  }
}
export default NextAuth(authOptions)