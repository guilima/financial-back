import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('roles_permissions', function(table) {
        table.integer('role_id').references('id').inTable('roles');
        table.integer('permission_id').references('id').inTable('permissions');
        table.primary(['role_id', 'permission_id']);
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('roles_permissions');
}

