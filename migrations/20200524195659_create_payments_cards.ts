import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('payments_cards', function(table) {
        table.integer('payment_id').references('id').inTable('payments');
        table.integer('card_id').references('id').inTable('cards');
        table.primary(['payment_id', 'card_id']);
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('payments_cards');
}

