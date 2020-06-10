import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    await knex.schema.createTable('manufacturers', function(table) {
        table.increments();
        table.string('name', 30).unique().notNullable();
        table.string('description', 255);
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('manufacturers');
}

