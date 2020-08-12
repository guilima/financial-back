import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('payments_tags', function(table) {
        table.integer('payment_id').references('id').inTable('payments');
        table.integer('tag_id').references('id').inTable('tags');
        table.primary(['payment_id', 'tag_id']);
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('payments_tags');
}

