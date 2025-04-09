import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'kategori'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // Primary key
      table.string('nama').notNullable()
      table.enum('tipe', ['Pemasukkan', 'Pengeluaran']).notNullable()
      table.dateTime('created_at').notNullable().defaultTo(this.now())
      table.dateTime('updated_at').notNullable().defaultTo(this.now())      
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
