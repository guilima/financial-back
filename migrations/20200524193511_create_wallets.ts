import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    await knex.schema.createTable('wallets', function(table) {
        table.increments();
        table.string('name', 30).unique().notNullable();
        table.string('description', 255);
        table.integer('user_id').references('id').inTable('users');
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('wallets');
}

