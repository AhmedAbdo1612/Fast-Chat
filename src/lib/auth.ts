import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { db } from "./db";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || clientId.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }
  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_SECRET ");
  }
  return {
    clientId,
    clientSecret,
  };
}

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "email",
          type: "text",
        },

        name: {
          label: "name",
          type: "text",
        },
        image: {
          label: "image",
          type: "text",
        },
        id: {
          label: "id",
          type: "text",
        },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials.email || !credentials.id) {
          throw new Error("Failed to log in ");
        }
        const user = { ...credentials };

        const dbUser = (await db.get(`user:${user.id}`)) as User | null;
        if (dbUser) {
          return {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            image: dbUser.image,
          };
        } else {
          await db.set(user.id, {
            email: user.email,
            name: user.name,
            id: user.id,
            image: user.image,
          });
          await db.set(`user:email:${user.email}`, user.id)
        }
        return user;
      },
    }),
  ],
  callbacks:{
    // async jwt({token,user,session}){
    //   session.id = token.id
    //   console.log(session)
    //     const dbUser = (await db.get(`user:${token.id}`)) as User |null
    // if(!dbUser){
    //      token.id = user.id
    //      return token
    // }
    // console.log("DB user exisits\n", dbUser)
    // return {
    //     id:dbUser.id,
    //     name:dbUser.name,
    //     email:dbUser.email,
    //     image:dbUser.image

    // }
    // },
    async session({session,token,user}){
            session.user.id = token.sub|| user.id
            // session.user.name = token.name
            // session.user.email = token.email
            // session.user.image = token.picture

        return session
    },

  },
};
