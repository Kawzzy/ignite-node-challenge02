import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('desc').notNullable()
    table.boolean('isHealthy').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    // relation with users' table
    table.uuid('user_id').notNullable()
    table.foreign('user_id', 'fk_user_id')
      .references('id')
      .inTable('users')
      .deferrable('immediate')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}

