import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pencatatan'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('kategori_id').unsigned().references('id').inTable('kategori').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('kategori_id')
    })
  }
}