import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    await knex.schema.createTable('users', function(table) {
        table.increments();
        table.string('user_name', 30);
        table.string('full_name', 100);
        table.string('email', 320).notNullable();
        table.boolean('email_verified').defaultTo(false);
        table.specificType('created_at', 'timestamp').defaultTo(knex.fn.now());
        table.specificType('deleted_at', 'timestamp');
    });

    // UNIQUE INDEX not supported. Waiting PR resolve, see: https://github.com/knex/knex/pull/2401
    return knex.schema.raw(`CREATE UNIQUE INDEX ON "users" ("email") WHERE "deleted_at" IS NULL`);
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('users');
}

