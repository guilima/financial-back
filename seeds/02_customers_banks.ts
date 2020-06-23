import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("customers_banks").del()
        .then(() => {
            // Inserts seed entries
            return knex("customers_banks").insert([
                { customer_id: 1, bank_id: 0 },
                { customer_id: 1, bank_id: 341 },
                { customer_id: 2, bank_id: 1 },
            ]);
        });
};
