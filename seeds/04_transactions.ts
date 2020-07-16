import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("transactions").del()
        .then(() => {
            // Inserts seed entries
            return knex("transactions").insert([
                { payment_id: 1, type_id: 3, customer_id: 1, bank_id: 0 },
                { payment_id: 2, type_id: 2, customer_id: 1, bank_id: 0 },
                { payment_id: 3, type_id: 3, customer_id: 1, bank_id: 0 },
                { payment_id: 4, type_id: 1, customer_id: 1, bank_id: 341 },
                { payment_id: 5, type_id: 1, customer_id: 1, bank_id: 341 },
                { payment_id: 6, type_id: 3, customer_id: 2, bank_id: 1 },
            ]);
        });
};
