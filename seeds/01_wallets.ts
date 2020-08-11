import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("wallets").del()
        .then(() => {
            // Inserts seed entries
            return knex("wallets").insert([
                { user_id: 1, name: 'Reforma', description: 'Custos com reforma do apartamento novo' },
                { user_id: 1, name: 'Mercado', description: 'Custos com mercado e compras em lojas' },
            ]);
        });
};