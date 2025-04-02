import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddTipeToKategori extends BaseSchema {
  protected tableName = 'kategori'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('tipe', ['Pemasukkan', 'Pengeluaran']).notNullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tipe')
    })
  }
}
