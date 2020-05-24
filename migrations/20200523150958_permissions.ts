import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('permissions', function(table) {
        table.increments();
        table.string('name', 30).unique();
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('permissions');
}

