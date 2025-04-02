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
  declare tipe: string

  @column()
  declare catatan: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare public userId: number

  @belongsTo(() => User)
  declare public user: BelongsTo<typeof User>

  @column()
  declare public kategoriId: number

  @belongsTo(() => Kategori)
  declare public kategori: BelongsTo<typeof Kategori>
}
