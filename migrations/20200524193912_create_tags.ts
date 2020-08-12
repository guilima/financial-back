import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    await knex.schema.createTable('tags', function(table) {
        table.increments();
        table.string('name', 30).index().notNullable();
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('tags');
}

