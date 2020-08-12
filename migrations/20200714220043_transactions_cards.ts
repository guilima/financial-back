import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('transactions_cards', function(table) {
        table.integer('transaction_id').references('id').inTable('transactions');
        table.integer('card_id').references('id').inTable('cards');
        table.primary(['transaction_id', 'card_id']);
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('transactions_cards');
}

