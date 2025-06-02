import type { HttpContext } from "@adonisjs/core/http"
import User from "../models/user.js" // Pastikan path ini benar ke model User Anda
import { OAuth2Client } from "google-auth-library"
// schema dan rules mungkin tidak lagi diperlukan di file ini jika validasi dipindah ke model atau tidak digunakan di sini
import { schema, rules } from "@adonisjs/validator"
import { DateTime } from "luxon"
import { sendWelcomeEmail } from "../services/send_welcome_email.js" // 👈 Impor layanan email Anda

// Nama kelas controller biasanya diawali huruf besar: SessionController
export default class SessionController { // Mengganti session_controller menjadi SessionController
  private googleClient: OAuth2Client

  constructor() {
    // Pastikan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET ada di .env Anda
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.warn("PERINGATAN: GOOGLE_CLIENT_ID atau GOOGLE_CLIENT_SECRET tidak dikonfigurasi di .env. Fitur Google Login mungkin tidak berfungsi.")
      this.googleClient = new OAuth2Client('', '') // Inisialisasi default jika env var tidak ada
    } else {
      this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
    }
  }

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
    try {
      const { email, password, fullName } = request.only(["email", "password", "fullName"])
      console.log('[SessionController] Data request:', { email, fullName });

      // Pengecekan apakah email sudah ada
      const existingUser = await User.query().where("email", email).first()
      if (existingUser) {
        return response.status(400).send({ // Sebaiknya 409 Conflict untuk resource yang sudah ada
          message: "Email sudah terdaftar, silakan gunakan email lain atau login.",
        })
      }

      // Membuat user baru
      // Diasumsikan model User Anda menghash password secara otomatis melalui hook (misal, beforeSave)
      const user = await User.create({
        fullName: fullName,
        email: email,
        password: password, // Password dikirim apa adanya, model akan menghash
        avatar: null,
        googleId: null,
        emailVerifiedAt: null,
      })
      console.log(`[SessionController] User berhasil disimpan. ID: ${user.id}, Email: ${user.email}`);

      // --- Kirim Email Selamat Datang --- 👇
      if (user.email && user.fullName) { // Pastikan fullName ada, karena digunakan di template email
        try {
          console.log('[SessionController] Kondisi terpenuhi, memanggil sendWelcomeEmail...');
          await sendWelcomeEmail(user.email, user.fullName);
          console.log('[SessionController] Pemanggilan sendWelcomeEmail selesai.');
        } catch (emailError) {
          console.error('❌ [SessionController] Gagal mengirim email selamat datang:', emailError.message);
          // Anda bisa memutuskan apakah error kirim email ini fatal atau tidak.
          // Saat ini, proses registrasi akan tetap dianggap berhasil.
        }
      } else {
        console.warn('[SessionController] Kondisi untuk mengirim email TIDAK terpenuhi (email atau fullName kosong).');
      }
      // --- Akhir Pengiriman Email Selamat Datang ---

      console.log('[SessionController] Method register selesai dengan sukses.');
      return response.created({ // Menggunakan 201 Created untuk resource baru
        message: "Registrasi berhasil! Selamat datang.", // Pesan bisa disesuaikan
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
      // Cek spesifik untuk error duplikasi jika tidak ditangani oleh pengecekan existingUser di atas (misal, race condition)
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
    // ... (kode googleLogin Anda tetap sama, pastikan password dihandle jika membuat user baru)
    // Jika membuat user baru dari Google, pastikan field password diisi dengan sesuatu
    // (misal, string acak yang panjang) karena password di model User Anda mungkin wajib
    // dan tidak di-hash otomatis jika dikirim string kosong.
    // Contoh saat create user dari Google:
    // password: crypto.randomBytes(16).toString('hex'), // Jika User model tidak auto-hash string kosong
    // ... (sisa kode googleLogin Anda) ...
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
        return response.status(400).send({
          message: "Invalid Google token",
        })
      }

      const { email, name, picture, sub: googleId, email_verified } = payload

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

      console.log("✅ Google payload:", { email, name, picture, googleId, email_verified });

      let user = await User.findBy("email", email)

      if (!user) {
        console.log("🔄 Membuat user baru dari Google...")
        user = await User.create({
          email: email,
          fullName: name || "Pengguna Google",
          avatar: picture || null,
          googleId: googleId,
          // Jika model User Anda mengharuskan password dan menghashnya otomatis:
          
          emailVerifiedAt: email_verified ? DateTime.now() : null,
        })
        console.log("✅ User baru dari Google dibuat:", user.email)
      } else {
        console.log("🔄 Memperbarui user yang ada dengan info Google...")
        let needsUpdate = false
        if (!user.googleId && googleId) {
          user.googleId = googleId
          needsUpdate = true
        }
        if (!user.avatar && picture) {
          user.avatar = picture
          needsUpdate = true
        }
        if (!user.emailVerifiedAt && email_verified) {
          user.emailVerifiedAt = DateTime.now()
          needsUpdate = true
        }
        // Jika user sudah ada tapi belum punya password (misal daftar via Google dulu lalu coba set password),
        // bagian ini tidak dihandle di sini. Ini hanya link akun Google.
        if (needsUpdate) {
          await user.save()
          console.log("✅ User yang ada diperbarui dengan info Google:", user.email)
        }
      }

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
        return response.status(400).send({ message: "Data tidak valid", errors: error.messages, })
      }
      if (error.message && error.message.includes("Token used too late")) {
        return response.status(400).send({ message: "Google token sudah expired, silakan coba lagi.", })
      }
      if (error.message && error.message.includes("Invalid token")) {
        return response.status(400).send({ message: "Google token tidak valid, silakan coba lagi.", })
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
