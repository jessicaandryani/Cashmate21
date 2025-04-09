import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Pencatatan from './pencatatan.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
export default class Kategori extends BaseModel {
  public static table = 'kategori' // 👈 ini yang penting

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nama: string

  @column()
  declare tipe: string

  @hasMany(() => Pencatatan)
  declare public pencatatans: HasMany<typeof Pencatatan>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
