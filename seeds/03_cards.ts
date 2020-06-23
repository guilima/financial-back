import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("cards").del()
        .then(() => {
            // Inserts seed entries
            return knex("cards").insert([
                { customer_bank_id: 1, closing_date: "2020-01-12", due_date: "2020-01-19", type_id: 2, association_id: 2, },
                { customer_bank_id: 2, closing_date: null, due_date: null, type_id: 1, association_id: 2, },
                { customer_bank_id: 3, closing_date: null, due_date: null, type_id: 1, association_id: 2, },
            ]);
        });
};