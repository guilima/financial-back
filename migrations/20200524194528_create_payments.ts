import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    await knex.schema.createTable('payments', function(table) {
        table.increments();
        table.specificType('date', 'timestamp').defaultTo(knex.fn.now()).notNullable();
        table.decimal('price', 19, 4).notNullable();
        table.specificType('installment', 'smallint').notNullable();
        table.specificType('type_id', 'smallint').notNullable().comment('1 Dinheiro, 2 Transferência Bancária, 3 Cartão');
        table.integer('product_id').references('id').inTable('products');
        table.integer('wallet_id').references('id').inTable('wallets');
    });
}


export async function down(knex: Knex): Promise<any> {
    return knex.schema.dropTable('payments');
}

