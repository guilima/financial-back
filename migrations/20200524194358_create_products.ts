import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    await knex.schema.createTable('products', function(table) {
        table.increments();
        table.string('name', 100).index().notNullable();
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('products');
}

