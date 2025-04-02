import type { HttpContext } from '@adonisjs/core/http'
import Pencatatan from '../models/pencatatan.js'

export default class PencatatanController {
  async index({ auth }: HttpContext) {
    if (!auth.user) {
      return {
        message: 'User tidak terautentikasi',
        error: true,
      }
    }

    const data = await Pencatatan.query()
      .where('user_id', auth.user.id) // Hanya data milik user yang login
      .select('id', 'jumlah', 'tipe', 'catatan', 'kategoriId')

    return {
      message: 'Berhasil Menampilkan Data Catatan Keuangan',
      data,
    }
  }

  async store({ request, auth }: HttpContext) {
    if (!auth.user) {
      return {
        message: 'User tidak terautentikasi',
        error: true,
      }
    }

    const data = request.body()
    const user = auth.user

    const newData = await Pencatatan.create({
      jumlah: data.jumlah,
      tipe: data.tipe,
      catatan: data.catatan,
      kategoriId: data.kategori, // Menambahkan kategoriId
      userId: user.id, // Pastikan menyimpan user ID
    })

    return {
      message: 'Berhasil Membuat Catatan Keuangan',
      data: newData,
    }
  }

  async show({ params, auth }: HttpContext) {
    if (!auth.user) {
      return {
        message: 'User tidak terautentikasi',
        error: true,
      }
    }

    const data = await Pencatatan.query()
      .where('id', params.id)
      .where('user_id', auth.user.id) // Pastikan user hanya bisa melihat miliknya
      .first()

    if (!data) {
      return {
        message: 'Catatan tidak ditemukan atau bukan milik Anda',
        error: true,
      }
    }

    return {
      message: 'Berhasil Menampilkan Catatan Keuangan Berdasarkan ID',
      data,
    }
  }

  async update({ params, request, auth }: HttpContext) {
    if (!auth.user) {
      return {
        message: 'User tidak terautentikasi',
        error: true,
      }
    }

    const data = request.body()

    const pencatatan = await Pencatatan.query()
      .where('id', params.id)
      .where('user_id', auth.user.id) // Hanya bisa update milik user
      .first()

    if (!pencatatan) {
      return {
        message: 'Catatan tidak ditemukan atau bukan milik Anda',
        error: true,
      }
    }

    await pencatatan.merge({
      jumlah: data.jumlah,
      tipe: data.tipe,
      catatan: data.catatan,
    }).save()

    return {
      message: 'Berhasil Update Catatan Keuangan',
      data: pencatatan,
    }
  }

  async destroy({ params, auth }: HttpContext) {
    if (!auth.user) {
      return {
        message: 'User tidak terautentikasi',
        error: true,
      }
    }

    const pencatatan = await Pencatatan.query()
      .where('id', params.id)
      .where('user_id', auth.user.id) // Pastikan user hanya bisa menghapus miliknya
      .first()

    if (!pencatatan) {
      return {
        message: 'Catatan tidak ditemukan atau bukan milik Anda',
        error: true,
      }
    }

    await pencatatan.delete()

    return {
      message: 'Berhasil Menghapus Catatan Keuangan',
    }
  }
}
