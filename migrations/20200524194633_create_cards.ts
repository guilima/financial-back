import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    await knex.schema.createTable('cards', function(table) {
        table.increments();
        table.date('due_date');
        table.date('closing_date');
        table.specificType('type_id', 'smallint').notNullable().comment('1 Debito, 2 Credito');
        table.specificType('association_id', 'smallint').notNullable().comment('1 Visa, 2 Mastercard');
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('cards');
}

