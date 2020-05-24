import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    await knex.schema.createTable('roles', function(table) {
        table.increments();
        table.string('name', 20).unique();
        table.text('description');
    });
    return knex('roles').insert([
        {name: 'user', description: 'View stats, analytics, and service configuration information for all services on an account.'},
    ]);
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('roles');
}

