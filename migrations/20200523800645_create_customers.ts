import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    await knex.schema.createTable('customers', function(table) {
        table.increments();
        table.string('name', 50).notNullable();
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('customers');
}

