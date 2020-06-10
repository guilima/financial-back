import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    return knex.schema.createTable('logins', function(table) {
        table.increments('id');
        table.specificType('password_hash', 'char(128)');
        table.binary('password_salt');
        table.specificType('logged_at', 'timestamp').defaultTo(knex.fn.now()).notNullable();
        table.specificType('ip_address', 'inet');
        table.integer('user_id').references('id').inTable('users');
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('logins');
}

