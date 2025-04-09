import { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { schema } from '@adonisjs/validator'

export default class ProfileController {
  async updateProfile({ request, auth, response }: HttpContext) {
    const user = await auth.getUserOrFail()

    const { fullName, avatar } = await request.validate({
      schema: schema.create({
        fullName: schema.string(),
        avatar: schema.string.optional(),
      }),
    })

    user.fullName = fullName
    if (avatar) user.avatar = avatar

    await user.save()
    return response.ok({ message: 'Profil berhasil diperbarui' })
  }

  async changePassword({ request, auth, response }: HttpContext) {
    const user = await auth.getUserOrFail()
  
    const { oldPassword, newPassword, confirmPassword } = await request.validate({
      schema: schema.create({
        oldPassword: schema.string(),
        newPassword: schema.string(),
        confirmPassword: schema.string(),
      }),
    })
  
    const isValidOldPassword = await hash.verify(user.password, oldPassword)
    if (!isValidOldPassword) {
      return response.unauthorized({ message: 'Password lama salah' })
    }
  
    if (newPassword !== confirmPassword) {
      return response.badRequest({ message: 'Konfirmasi password tidak cocok' })
    }
  
    user.password = newPassword // ✅ biarkan Adonis yang hash otomatis
    await user.save()
  
    return response.ok({ message: 'Password berhasil diubah' })
  }
}
