import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('users_roles', function(table) {
        table.integer('user_id').references('id').inTable('users');
        table.integer('role_id').references('id').inTable('roles');
        table.primary(['user_id', 'role_id']);
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('users_roles');
}

