import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Transactions extends BaseSchema {
  protected tableName = 'pencatatan'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('jumlah')
      table.enum('tipe', ['pemasukan', 'pengeluaran']).notNullable()
      table.string('catatan').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
