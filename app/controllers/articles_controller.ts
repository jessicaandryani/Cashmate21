// File: app/controllers/articles_controller.ts

import type { HttpContext } from '@adonisjs/core/http' // Impor HttpContext dari AdonisJS v6
import Article from '#models/article' // Impor model Article menggunakan alias #models

export default class ArticlesController {
  /**
   * Metode untuk mengambil daftar semua artikel.
   * Hanya mengembalikan 'id' dan 'title' untuk daftar singkat.
   */
  async index({ response }: HttpContext) {
    try {
      // Mengambil semua artikel dari database, hanya memilih kolom id dan title
      const articles = await Article.query().select('id', 'title')
      // Mengembalikan daftar artikel dalam format JSON dengan status 200 OK
      return response.ok({ data: articles })
    } catch (error) {
      console.error('Error fetching articles:', error)
      // Mengembalikan error server internal jika terjadi masalah
      return response.internalServerError({ message: 'Terjadi kesalahan saat mengambil artikel.' })
    }
  }

  /**
   * Metode untuk mengambil detail satu artikel berdasarkan ID.
   */
  async show({ params, response }: HttpContext) {
    try {
      // Mencari artikel berdasarkan ID yang diberikan di parameter URL
      const article = await Article.find(params.id)
      // Jika artikel tidak ditemukan, kembalikan status 404 Not Found
      if (!article) {
        return response.notFound({ message: 'Artikel tidak ditemukan' })
      }
      // Mengembalikan detail artikel dalam format JSON dengan status 200 OK
      return response.ok({ data: article })
    } catch (error) {
      console.error(`Error fetching article with ID ${params.id}:`, error)
      // Mengembalikan error server internal jika terjadi masalah
      return response.internalServerError({ message: 'Terjadi kesalahan saat mengambil detail artikel.' })
    }
  }

  /**
   * Metode untuk menyimpan artikel baru ke database.
   */
  async store({ request, response }: HttpContext) {
    try {
      // Mengambil data title dan content dari body request
      const data = request.only(['title', 'content'])

      // Validasi: pastikan title dan content tidak kosong
      if (!data.title || !data.content) {
        // Mengembalikan status 400 Bad Request jika data tidak lengkap
        return response.badRequest({ message: 'Title dan content wajib diisi' })
      }

      // Membuat artikel baru di database
      const article = await Article.create(data)
      // Mengembalikan artikel yang baru dibuat dengan status 201 Created
      return response.created({ message: 'Artikel berhasil dibuat', data: article })
    } catch (error) {
      console.error('Error storing article:', error)
      // Mengembalikan error server internal jika terjadi masalah
      return response.internalServerError({ message: 'Terjadi kesalahan saat menyimpan artikel.' })
    }
  }
}
