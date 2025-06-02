import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { schema, rules } from '@adonisjs/validator'
import { cuid } from '@adonisjs/core/helpers'
import path from 'path'
import fs from 'fs/promises'

export default class ProfileController {
  // ✅ Get user profile
  async getProfile({ auth, response }: HttpContext) {
    try {
      const user = auth.user!

      // Refresh user data from database to get latest changes
      await user.refresh()

      return response.ok({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      return response.internalServerError({
        message: 'Gagal mengambil data profil',
      })
    }
  }

  // ✅ Update profil (nama & avatar)
  async updateProfile({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!

      const profileSchema = schema.create({
        fullName: schema.string({ trim: true }, [rules.maxLength(100), rules.minLength(2)]),
        avatar: schema.file.optional({
          size: '2mb',
          extnames: ['jpg', 'jpeg', 'png'],
        }),
      })

      const { fullName, avatar } = await request.validate({
        schema: profileSchema,
        messages: {
          'fullName.required': 'Nama lengkap wajib diisi',
          'fullName.minLength': 'Nama lengkap minimal 2 karakter',
          'fullName.maxLength': 'Nama lengkap maksimal 100 karakter',
          'avatar.size': 'Ukuran file maksimal 2MB',
          'avatar.extnames': 'Format file harus JPG, JPEG, atau PNG',
        },
      })

      // Update nama
      user.fullName = fullName

      // Handle avatar upload
      if (avatar) {
        try {
          // Pastikan direktori ada
          const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'avatar')
          await fs.mkdir(uploadPath, { recursive: true })

          // Hapus avatar lama jika ada
          if (user.avatar) {
            try {
              const oldAvatarPath = path.join(process.cwd(), 'public', user.avatar)
              await fs.access(oldAvatarPath) // Check if file exists
              await fs.unlink(oldAvatarPath)
              console.log('Old avatar deleted successfully')
            } catch (error) {
              console.log('Old avatar file not found or already deleted')
            }
          }

          // Upload avatar baru
          const fileName = `${cuid()}.${avatar.extname}`

          await avatar.move(uploadPath, {
            name: fileName,
            overwrite: true,
          })

          user.avatar = `/uploads/avatar/${fileName}`
          console.log('New avatar saved:', user.avatar)
        } catch (uploadError) {
          console.error('Avatar upload error:', uploadError)
          return response.badRequest({
            message: 'Gagal mengupload avatar',
            error: uploadError.message,
          })
        }
      }

      // Save to database
      await user.save()

      // Refresh user data to ensure we have the latest
      await user.refresh()

      console.log('Profile updated successfully:', {
        fullName: user.fullName,
        avatar: user.avatar,
      })

      return response.ok({
        message: 'Profil berhasil diperbarui',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      console.error('Profile update error:', error)

      if (error.code === 'E_VALIDATION_FAILURE') {
        return response.badRequest({
          message: 'Data tidak valid',
          errors: error.messages,
        })
      }

      return response.internalServerError({
        message: 'Gagal memperbarui profil',
        error: error.message,
      })
    }
  }

  // ✅ Ganti password
  async changePassword({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!

      const passwordSchema = schema.create({
        oldPassword: schema.string({}, [rules.required()]),
        newPassword: schema.string({}, [rules.minLength(6), rules.maxLength(255)]),
        confirmPassword: schema.string({}, [rules.confirmed('newPassword')]),
      })

      const { oldPassword, newPassword } = await request.validate({
        schema: passwordSchema,
        messages: {
          'oldPassword.required': 'Password lama wajib diisi',
          'newPassword.required': 'Password baru wajib diisi',
          'newPassword.minLength': 'Password baru minimal 6 karakter',
          'newPassword.maxLength': 'Password baru maksimal 255 karakter',
          'confirmPassword.confirmed': 'Konfirmasi password tidak cocok',
        },
      })

      // Verifikasi password lama
      const passwordValid = await hash.verify(user.password, oldPassword)
      if (!passwordValid) {
        return response.badRequest({
          message: 'Password lama tidak cocok',
        })
      }

      // Pastikan password baru berbeda dengan password lama
      const isSamePassword = await hash.verify(user.password, newPassword)
      if (isSamePassword) {
        return response.badRequest({
          message: 'Password baru harus berbeda dengan password lama',
        })
      }

      // Update password
      user.password = newPassword
      await user.save()

      return response.ok({
        message: 'Password berhasil diganti',
      })
    } catch (error) {
      console.error('Password change error:', error)

      if (error.code === 'E_VALIDATION_FAILURE') {
        return response.badRequest({
          message: 'Data tidak valid',
          errors: error.messages,
        })
      }

      return response.internalServerError({
        message: 'Gagal mengubah password',
        error: error.message,
      })
    }
  }

  // ✅ Delete avatar
  async deleteAvatar({ auth, response }: HttpContext) {
    try {
      const user = auth.user!

      if (!user.avatar) {
        return response.badRequest({
          message: 'Tidak ada avatar untuk dihapus',
        })
      }

      // Hapus file avatar
      try {
        const avatarPath = path.join(process.cwd(), 'public', user.avatar)
        await fs.access(avatarPath) // Check if file exists
        await fs.unlink(avatarPath)
        console.log('Avatar file deleted successfully')
      } catch (error) {
        console.log('Avatar file not found or already deleted')
      }

      // Update database
      user.avatar = null
      await user.save()

      // Refresh user data
      await user.refresh()

      return response.ok({
        message: 'Avatar berhasil dihapus',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          avatar: null,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      console.error('Delete avatar error:', error)
      return response.internalServerError({
        message: 'Gagal menghapus avatar',
        error: error.message,
      })
    }
  }
}
