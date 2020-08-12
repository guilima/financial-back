import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("payments_tags").del()
        .then(() => {
            // Inserts seed entries
            return knex("payments_tags").insert([
                { payment_id: 1, tag_id: 1 },
                { payment_id: 1, tag_id: 2 },
                { payment_id: 2, tag_id: 2 },
                { payment_id: 3, tag_id: 1 },
            ]);
        });
};
