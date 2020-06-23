import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    await knex.schema.createTable('customers_banks', function(table) {
        table.increments();
        table.specificType('bank_id', 'smallint').notNullable().comment('0 None, 1 Banco do Brasil, 341 Itaú');
        table.integer('customer_id').references('id').inTable('customers');
        table.unique(['bank_id', 'customer_id']);
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('customers_banks');
}

