import type { HttpContext } from '@adonisjs/core/http'
import Pencatatan from '../models/pencatatan.js'

export default class PencatatanController {
  async index({ auth, request }: HttpContext) {
    if (!auth.user) {
      return {
        message: 'User tidak terautentikasi',
        error: true,
      }
    }

    const bulan = request.input('bulan') // format: '2025-04'
    const minggu = request.input('minggu') // format: '2025-04-07'

    const query = Pencatatan.query()
      .where('user_id', auth.user.id)
      .preload('kategori')
      .select('id', 'jumlah', 'tipe', 'catatan', 'kategoriId', 'created_at')
      .orderBy('created_at', 'desc') // Urutkan dari terbaru

    // Filter berdasarkan bulan
    if (bulan) {
      query.whereRaw("to_char(created_at, 'YYYY-MM') = ?", [bulan])
    }

    // Filter berdasarkan minggu (dari tanggal awal minggu)
    if (minggu) {
      const start = new Date(minggu)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)

      query.whereBetween('created_at', [start.toISOString(), end.toISOString()])
    }

    const data = await query

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

    const data = request.only(['jumlah', 'tipe', 'catatan', 'kategori'])

    if (!['pemasukan', 'pengeluaran'].includes(data.tipe)) {
      return {
        message: 'Tipe harus berupa "pemasukan" atau "pengeluaran"',
        error: true,
      }
    }

    if (!data.jumlah || isNaN(data.jumlah)) {
      return {
        message: 'Jumlah wajib diisi dan harus berupa angka',
        error: true,
      }
    }

    if (!data.kategori) {
      return {
        message: 'Kategori wajib diisi',
        error: true,
      }
    }

    const newData = await Pencatatan.create({
      jumlah: data.jumlah,
      tipe: data.tipe,
      catatan: data.catatan,
      kategoriId: data.kategori,
      userId: auth.user.id,
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
      .where('user_id', auth.user.id)
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

    const data = request.only(['jumlah', 'tipe', 'catatan', 'kategori_id']);


    if (!['pemasukan', 'pengeluaran'].includes(data.tipe)) {
      return {
        message: 'Tipe harus berupa "pemasukan" atau "pengeluaran"',
        error: true,
      }
    }

    if (!data.jumlah || isNaN(data.jumlah)) {
      return {
        message: 'Jumlah wajib diisi dan harus berupa angka',
        error: true,
      }
    }

    const pencatatan = await Pencatatan.query()
      .where('id', params.id)
      .where('user_id', auth.user.id)
      .first()

    if (!pencatatan) {
      return {
        message: 'Catatan tidak ditemukan atau bukan milik Anda',
        error: true,
      }
    }

    await pencatatan
    .merge({
      jumlah: data.jumlah,
      tipe: data.tipe,
      catatan: data.catatan,
      kategoriId: data.kategori_id, // ← tambahkan ini
    })
    .save();
  

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
      .where('user_id', auth.user.id)
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
