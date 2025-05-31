import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { schema, rules } from '@adonisjs/validator'
import { cuid } from '@adonisjs/core/helpers'
import path from 'path'

export default class ProfileController {
  // ✅ Update profil (nama & avatar)
  async updateProfile({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const profileSchema = schema.create({
      fullName: schema.string({ trim: true }, [
        rules.maxLength(100),
      ]),
      avatar: schema.file.optional({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png'],
      }),
    })

    const { fullName, avatar } = await request.validate({ schema: profileSchema })

    user.fullName = fullName

    if (avatar) {
      const fileName = `${cuid()}.${avatar.extname}`
      await avatar.move(path.join(__dirname, '../../public/uploads/avatar'), {
        name: fileName,
        overwrite: true,
      })
      user.avatar = `/uploads/avatar/${fileName}`
    }

    await user.save()
    return response.ok({ message: 'Profil berhasil diperbarui', user })
  }

  // ✅ Ganti password
  async changePassword({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const passwordSchema = schema.create({
      oldPassword: schema.string(),
      newPassword: schema.string([rules.minLength(6)]),
      confirmPassword: schema.string([
        rules.confirmed('newPassword'),
      ]),
    })

    const { oldPassword, newPassword } = await request.validate({
      schema: passwordSchema,
    })

    const passwordValid = await hash.verify(user.password, oldPassword)

    if (!passwordValid) {
      return response.badRequest({ message: 'Password lama tidak cocok' })
    }

    user.password = newPassword
    await user.save()

    return response.ok({ message: 'Password berhasil diganti' })
  }
}
