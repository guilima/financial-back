import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('roles', function(table) {
        table.increments();
        table.string('name', 20).unique();
        table.string('description', 255);
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('roles');
}

