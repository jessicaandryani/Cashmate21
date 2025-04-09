import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Kategori from './kategori.js'

export default class Pencatatan extends BaseModel {
  public static table = 'pencatatan'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare jumlah: number

  @column()
  declare tipe: 'pemasukan' | 'pengeluaran' // ⬅️ opsional: bantu validasi tipe di level kode

  @column()
  declare catatan: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column({ columnName: 'user_id' }) // ⬅️ eksplisitkan nama kolom jika pakai snake_case
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column({ columnName: 'kategori_id' }) // ⬅️ juga disarankan eksplisitkan ini
  declare kategoriId: number

  @belongsTo(() => Kategori)
  declare kategori: BelongsTo<typeof Kategori>
}
