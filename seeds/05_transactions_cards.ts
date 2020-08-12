import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("transactions_cards").del()
        .then(() => {
            // Inserts seed entries
            return knex("transactions_cards").insert([
                { transaction_id: 1, card_id: 1 },
                { transaction_id: 2, card_id: 2 },
                { transaction_id: 3, card_id: 3 }
            ]);
        });
};
