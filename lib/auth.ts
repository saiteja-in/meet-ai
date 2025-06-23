import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins";
import { resend } from "./resend";
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    },
    google: {
      clientId: env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    },
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await resend.emails.send({
          from: "mail@saiteja.us",
          to: [email],
          subject: "Better Template - Verify your email",
          html: `
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 420px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 1px 6px #0001; padding: 32px 28px;">
                <h2 style="font-size: 1.3rem; font-weight: 600; margin: 0 0 12px 0; color: #222;">
                  Verify your email address
                </h2>
                <p style="font-size: 1rem; color: #555; margin: 0 0 24px 0;">
                  Use the OTP below to verify your email address for Better Template.
                </p>
                <div style="text-align: center; margin: 18px 0 32px 0;">
                  <span style="display: inline-block; font-size: 2rem; letter-spacing: 8px; font-weight: bold; color: #2255a4; background: #f4f8fb; border-radius: 8px; padding: 10px 24px;">
                    ${otp}
                  </span>
                </div>
                <p style="font-size: 0.97rem; color: #888; margin-bottom: 0;">
                  This OTP is valid for the next 10 minutes. If you did not request this, you can ignore this email.
                </p>
                <div style="margin-top: 36px; font-size: 0.93rem; color: #ccc; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                  &copy; ${new Date().getFullYear()} Better Template
                </div>
              </div>
            `,
        });
      },
    }),
    // admin(),
  ],
});
