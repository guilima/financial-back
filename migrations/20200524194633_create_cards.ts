import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    await knex.schema.createTable('cards', function(table) {
        table.increments();
        table.string('holder_name', 30).notNullable();
        table.date('due_date');
        table.date('closing_date');
        table.specificType('type_id', 'smallint').notNullable().comment('1 Debito, 2 Credito');
        table.specificType('association_id', 'smallint').notNullable().comment('1 Visa, 2 Mastercard');
        table.specificType('bank_id', 'smallint').notNullable().comment('1 Banco do Brasil, 341 Itaú');
        table.integer('user_id').references('id').inTable('users');
        table.unique(['type_id', 'holder_name', 'association_id', 'bank_id']);
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('cards');
}

