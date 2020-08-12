import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    await knex.schema.createTable('transactions', function(table) {
        table.increments();
        table.specificType('type_id', 'smallint').notNullable().comment('1 Dinheiro, 2 Cartão, 3 Transferência Bancária').defaultTo(0);
        table.specificType('bank_id', 'smallint').notNullable().comment('0 None, 1 Banco do Brasil, 341 Itaú').defaultTo(0);
        table.integer('payment_id').references('id').inTable('payments');
        table.integer('customer_id').references('id').inTable('customers');
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('transactions');
}