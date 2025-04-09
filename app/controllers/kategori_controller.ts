import type { HttpContext } from '@adonisjs/core/http'
import Kategori from '#models/kategori'

export default class KategoriController {
  async index({ response }: HttpContext) {
    const kategori = await Kategori.all()
    return response.ok({ data: kategori })
  }

  async store({ request, response }: HttpContext) {
    const data = request.only(['nama', 'tipe'])

    // Cek apakah sudah ada kategori yang sama
    const existing = await Kategori.query()
      .where('nama', data.nama)
      .andWhere('tipe', data.tipe)
      .first()

    if (existing) {
      return response.ok({ data: existing })
    }

    const kategori = await Kategori.create(data)
    return response.created({ message: 'Kategori berhasil dibuat', data: kategori })
  }
}
