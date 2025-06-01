// File: app/middleware/AuthInternalApiKeyMiddleware.ts

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

export default class AuthInternalApiKeyMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const apiKey = ctx.request.header('Authorization')

    if (!apiKey) {
      return ctx.response.unauthorized({ message: 'API key tidak disediakan.' })
    }

    const validApiKeys = [
      env.get('INTERNAL_API_KEY_REACT'),
      env.get('INTERNAL_API_KEY_SERVICE_A'),
    ].filter(Boolean)

    if (!validApiKeys.includes(apiKey)) {
      return ctx.response.unauthorized({ message: 'API key tidak valid.' })
    }

    return await next()
  }
}