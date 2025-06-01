// File: app/models/Article.ts

import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm' // Impor dari AdonisJS v6

export default class Article extends BaseModel {
  // Kolom ID sebagai primary key
  @column({ isPrimary: true })
  declare id: number // Gunakan 'declare' untuk properti yang tidak diinisialisasi di constructor

  // Kolom judul artikel
  @column()
  declare title: string

  // Kolom konten artikel
  @column()
  declare content: string

  // Kolom created_at (tanggal pembuatan)
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Kolom updated_at (tanggal terakhir diupdate)
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
