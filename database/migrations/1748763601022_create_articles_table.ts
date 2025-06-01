import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'articles'

  async up() {
   this.schema.createTable(this.tableName, (table) => {
      // Kolom ID auto-increment sebagai primary key
      table.increments('id')
      // Kolom judul artikel, tidak boleh null
      table.string('title').notNullable()
      // Kolom konten artikel, menggunakan tipe text karena bisa panjang, tidak boleh null
      table.text('content').notNullable()
      // Kolom timestamp untuk created_at dan updated_at, diatur otomatis oleh Adonis
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}