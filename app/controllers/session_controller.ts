import type { HttpContext } from "@adonisjs/core/http"
import User from "../models/user.js"
import { OAuth2Client } from "google-auth-library"
import { schema, rules } from "@adonisjs/validator"
import { DateTime } from "luxon"

export default class session_controller{
  private googleClient: OAuth2Client

  constructor() {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = request.only(["email", "password"])

    try {
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user, ["*"], { expiresIn: "3 days" })

      return response.ok({
        message: "Success Login",
        data: {
          access_token: token.value?.release(),
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
          },
        },
      })
    } catch (error) {
      console.error("LOGIN ERROR:", error.message)
      return response.status(401).send({
        message: "Login gagal, periksa email dan password kamu!",
      })
    }
  }

  async register({ request, response }: HttpContext) {
    try {
      const { email, password, fullName } = request.only(["email", "password", "fullName"])

      const existingUser = await User.query().where("email", email).first()
      if (existingUser) {
        return response.status(400).send({
          message: "Email sudah terdaftar, silakan gunakan email lain atau login.",
        })
      }

      const user = await User.create({
        fullName: fullName,
        email: email,
        password: password,
        avatar: null,
        googleId: null,
        emailVerifiedAt: null,
      })

      return response.ok({
        message: "Success Register",
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
          },
        },
      })
    } catch (error) {
      console.error("REGISTER ERROR:", error.message)
      return response.status(500).send({
        message: "Registrasi gagal, silakan coba lagi.",
        error: error.message,
      })
    }
  }

  async googleLogin({ request, response }: HttpContext) {
    try {
      if (!process.env.GOOGLE_CLIENT_ID) {
        console.error("❌ GOOGLE_CLIENT_ID not configured")
        return response.status(500).send({
          message: "Google authentication not configured",
        })
      }

      const googleSchema = schema.create({
        credential: schema.string({ trim: true }, [rules.required()]),
      })

      const { credential } = await request.validate({
        schema: googleSchema,
        messages: {
          "credential.required": "Google credential is required",
        },
      })

      console.log("🔄 Verifying Google token...")

      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      })

      const payload = ticket.getPayload()
      if (!payload) {
        console.error("❌ Invalid Google token payload")
        return response.status(400).send({
          message: "Invalid Google token",
        })
      }

      // ✅ Validasi email dari Google payload
      const { email, name, picture, sub: googleId } = payload

      if (!email) {
        console.error("❌ Email not provided by Google")
        return response.status(400).send({
          message: "Email tidak tersedia dari Google. Pastikan Anda memberikan izin akses email.",
        })
      }

      if (!googleId) {
        console.error("❌ Google ID not provided")
        return response.status(400).send({
          message: "Google ID tidak valid.",
        })
      }

      console.log("✅ Google payload:", { email, name, picture, googleId })

      // ✅ Sekarang email sudah pasti string, bukan undefined
      let user = await User.query().where("email", email).first()

      if (!user) {
        console.log("🔄 Creating new user from Google...")

        // ✅ Validasi data sebelum create user
        const userData = {
          email: email, // sudah dipastikan tidak undefined
          fullName: name || "Google User",
          avatar: picture || null,
          googleId: googleId, // sudah dipastikan tidak undefined
          password: "",
          emailVerifiedAt: DateTime.now(),
        }

        user = await User.create(userData)
        console.log("✅ New Google user created:", user.email)
      } else {
        console.log("🔄 Updating existing user with Google info...")
        let needsUpdate = false

        if (!user.googleId && googleId) {
          user.googleId = googleId
          needsUpdate = true
        }

        if (!user.avatar && picture) {
          user.avatar = picture
          needsUpdate = true
        }

        if (!user.emailVerifiedAt) {
          user.emailVerifiedAt = DateTime.now()
          needsUpdate = true
        }

        if (needsUpdate) {
          await user.save()
          console.log("✅ Existing user updated with Google info:", user.email)
        }
      }

      const token = await User.accessTokens.create(user, ["*"], { expiresIn: "3 days" })

      console.log("✅ Google login successful for:", user.email)

      return response.ok({
        message: "Success Login with Google",
        data: {
          access_token: token.value?.release(),
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
          },
        },
      })
    } catch (error) {
      console.error("❌ GOOGLE LOGIN ERROR:", error)

      if (error.code === "E_VALIDATION_FAILURE") {
        return response.status(400).send({
          message: "Data tidak valid",
          errors: error.messages,
        })
      }

      if (error.message && error.message.includes("Token used too late")) {
        return response.status(400).send({
          message: "Google token sudah expired, silakan coba lagi.",
        })
      }

      if (error.message && error.message.includes("Invalid token")) {
        return response.status(400).send({
          message: "Google token tidak valid, silakan coba lagi.",
        })
      }

      return response.status(500).send({
        message: "Login dengan Google gagal, silakan coba lagi.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      const user = await auth.getUserOrFail()
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)

      return response.ok({
        message: "Success Logout",
      })
    } catch (error) {
      console.error("LOGOUT ERROR:", error.message)
      return response.status(500).send({
        message: "Logout gagal, silakan coba lagi.",
      })
    }
  }
}
