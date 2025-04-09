import { BaseSchema } from '@adonisjs/lucid/schema'


export default class CreatePencatatansTable extends BaseSchema {
  protected tableName = 'pencatatan'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('jumlah')
      table.enum('tipe', ['pemasukan', 'pengeluaran']).notNullable()
      table.string('catatan', 255).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
