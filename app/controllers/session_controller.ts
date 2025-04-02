import type { HttpContext } from '@adonisjs/core/http'
import User from '../models/user.js'

export default class SessionController {
  async login({ request }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user, ['*'], { expiresIn: '3 days'})

    return {
      message: 'Succes Login',
      data: {
        access_token: token.value?.release(),
      },
    }
  }

  async register({ request }: HttpContext) {
    const { email, password, fullname } = request.only(['email', 'password', 'fullname'])
    const user = await User.create({
      fullName: fullname,
      email: email,
      password: password,
    })
    console.log(user)
    return {
      message: 'Succes Resgister',
    }
  }

  async logout({auth}: HttpContext){
    const user = auth.getUserOrFail()

    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return{
      massage: 'Succes Logout'
    }
  }
}
