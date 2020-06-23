import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('products_manufacturers', function(table) {
        table.increments();
        table.integer('product_id').references('id').inTable('products');
        table.integer('manufacturer_id').references('id').inTable('manufacturers');
        table.unique(['product_id', 'manufacturer_id']);
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('products_manufacturers');
}

