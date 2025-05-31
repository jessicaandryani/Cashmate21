import type { HttpContext } from '@adonisjs/core/http'
import User from '../models/user.js'
import hash from '@adonisjs/core/services/hash'

export default class SessionController {
  async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
  
    try {
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user, ['*'], { expiresIn: '3 days' })
  
      return {
        message: 'Succes Login',
        data: {
          access_token: token.value?.release(),
        },
      }
    } catch (error) {
      console.error('LOGIN ERROR:', error.message)
      return response.status(401).send({
        message: 'Login gagal, periksa email dan password kamu!',
      })
    }
  }
  
  

  async register({ request }: HttpContext) {
    const { email, password, fullName } = request.only(['email', 'password', 'fullName'])

    const user = new User()
    user.fullName = fullName
    user.email = email
    user.password = password
    
    await user.save()
    
  
    return {
      message: 'Success Register',
    }
  }
  
  

  async logout({ auth }: HttpContext) {
    const user = await auth.getUserOrFail()

    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return {
      message: 'Success Logout',
    }
  }
}
