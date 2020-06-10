import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("payments_cards").del()
        .then(() => {
            // Inserts seed entries
            return knex("payments_cards").insert([
                { payment_id: 2, card_id: 1 },
            ]);
        });
};
