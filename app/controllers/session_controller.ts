// app/controllers/session_controller.ts
import type { HttpContext } from "@adonisjs/core/http"
import User from "../models/user.js"
import { OAuth2Client } from "google-auth-library"
import { schema, rules } from "@adonisjs/validator"
import { DateTime } from "luxon"
import { sendWelcomeEmail } from "../services/send_welcome_email.js" // Pastikan ini diimpor
import crypto from 'node:crypto'
// import hash from '@adonisjs/core/services/hash' // Tidak perlu jika model menghash otomatis

export default class SessionController {
  private googleClient: OAuth2Client

  constructor() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.warn("PERINGATAN: GOOGLE_CLIENT_ID atau GOOGLE_CLIENT_SECRET tidak dikonfigurasi di .env. Fitur Google Login mungkin tidak berfungsi.")
      this.googleClient = new OAuth2Client('', '')
    } else {
      this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
    }
  }

  // ... (method login dan register Anda tetap sama) ...
  async login({ request, response }: HttpContext) {
    const { email, password } = request.only(["email", "password"])
    console.log(`[LoginAttempt] Mencoba login dengan Email: "${email}", Panjang Password: ${password ? password.length : 'undefined'}`);

    try {
      const user = await User.verifyCredentials(email, password)
      // @ts-ignore
      const token = await User.accessTokens.create(user, ["*"], { expiresIn: "3 days" })
      
      console.log(`[LoginAttempt] Login BERHASIL untuk user ID: ${user.id}, Email: ${user.email}`);
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
    console.log('[SessionController] Method register dimulai.');
    // Menggunakan request.only() sesuai kode terakhir Anda. Pertimbangkan validasi VineJS untuk produksi.
    const { email, password, fullName } = request.only(["email", "password", "fullName"])
    console.log('[SessionController] Data request:', { email, fullName });

    try {
      const existingUser = await User.query().where("email", email).first()
      if (existingUser) {
        return response.status(409).send({ 
          message: "Email sudah terdaftar, silakan gunakan email lain atau login.",
        })
      }

      // Diasumsikan model User Anda menghash password secara otomatis melalui hook
      const user = await User.create({
        fullName: fullName,
        email: email,
        password: password, 
        avatar: null,
        googleId: null,
        emailVerifiedAt: null, 
      })
      console.log(`[SessionController] User berhasil disimpan. ID: ${user.id}, Email: ${user.email}`);

      if (user.email && user.fullName) {
        try {
          console.log('[SessionController] Kondisi terpenuhi, memanggil sendWelcomeEmail untuk registrasi biasa...');
          await sendWelcomeEmail(user.email, user.fullName);
          console.log('[SessionController] Pemanggilan sendWelcomeEmail selesai untuk registrasi biasa.');
        } catch (emailError) {
          console.error('❌ [SessionController] Gagal mengirim email selamat datang (reg biasa):', emailError.message);
        }
      } else {
        console.warn('[SessionController] Kondisi untuk mengirim email (reg biasa) TIDAK terpenuhi.');
      }

      console.log('[SessionController] Method register selesai dengan sukses.');
      return response.created({
        message: "Registrasi berhasil! Selamat datang.",
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
      if (error.code === 'ER_DUP_ENTRY' || (error.message && error.message.toLowerCase().includes('unique constraint failed'))) {
        return response.status(409).send({ message: 'Email ini sudah terdaftar.' });
      }
      return response.status(500).send({
        message: "Registrasi gagal, silakan coba lagi.",
        error: process.env.NODE_ENV === "development" ? error.message : "Terjadi kesalahan internal",
      })
    }
  }


  async googleLogin({ request, response }: HttpContext) {
    try {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error("❌ GOOGLE_CLIENT_ID atau GOOGLE_CLIENT_SECRET tidak dikonfigurasi")
        return response.status(500).send({
          message: "Autentikasi Google tidak dikonfigurasi dengan benar di server",
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
        return response.status(400).send({ message: "Invalid Google token" })
      }

      const { email, name, picture, sub: googleId, email_verified } = payload
      if (!email || !googleId) {
        console.error("❌ Email atau Google ID tidak tersedia dari Google payload")
        return response.status(400).send({ message: "Informasi email atau Google ID tidak lengkap dari Google." })
      }
      console.log("✅ Google payload:", { email, name, picture, googleId, email_verified });

      let user = await User.findBy("email", email)
      let isNewUserCreatedViaGoogle = false; // Flag untuk menandai jika user baru dibuat

      if (!user) {
        console.log("🔄 Membuat user baru dari Google...")
        user = await User.create({
          email: email,
          fullName: name || "Pengguna Google",
          avatar: picture || null,
          googleId: googleId,
          password: crypto.randomBytes(16).toString('hex'), // Password acak
          emailVerifiedAt: email_verified ? DateTime.now() : null,
        })
        isNewUserCreatedViaGoogle = true; // Tandai sebagai user baru
        console.log("✅ User baru dari Google dibuat:", user.email)
      } else {
        console.log("🔄 Memperbarui user yang ada dengan info Google...")
        let needsUpdate = false
        if (!user.googleId && googleId) {
          user.googleId = googleId;
          needsUpdate = true;
        }
        if (!user.avatar && picture) {
          user.avatar = picture;
          needsUpdate = true;
        }
        if (!user.emailVerifiedAt && email_verified) { // Jika email belum terverifikasi & Google bilang sudah
          user.emailVerifiedAt = DateTime.now();
          needsUpdate = true;
        }
        if (needsUpdate) {
          await user.save()
          console.log("✅ User yang ada diperbarui dengan info Google:", user.email)
        }
      }

      // --- Kirim Email Selamat Datang jika user baru dibuat via Google --- 👇
      if (isNewUserCreatedViaGoogle && user.email && user.fullName) {
        try {
          console.log('[SessionController-GoogleLogin] Kondisi terpenuhi, memanggil sendWelcomeEmail...');
          await sendWelcomeEmail(user.email, user.fullName);
          console.log('[SessionController-GoogleLogin] Pemanggilan sendWelcomeEmail selesai.');
        } catch (emailError) {
          console.error('❌ [SessionController-GoogleLogin] Gagal mengirim email selamat datang:', emailError.message);
        }
      }
      // --- Akhir Pengiriman Email Selamat Datang ---

      // @ts-ignore
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
        return response.status(400).send({ message: "Data tidak valid", errors: error.messages })
      }
      if (error.message?.includes("Token used too late")) {
        return response.status(400).send({ message: "Google token sudah expired, silakan coba lagi." })
      }
      if (error.message?.includes("Invalid token")) {
        return response.status(400).send({ message: "Google token tidak valid, silakan coba lagi." })
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
      // @ts-ignore
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
      return response.ok({ message: "Success Logout" })
    } catch (error) {
      console.error("LOGOUT ERROR:", error.message)
      return response.status(500).send({ message: "Logout gagal, silakan coba lagi." })
    }
  }
}
