import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('products_categories', function(table) {
        table.integer('product_id').references('id').inTable('products');
        table.integer('category_id').references('id').inTable('categories');
        table.primary(['product_id', 'category_id']);
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('products_categories');
}

