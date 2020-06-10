import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("cards").del()
        .then(() => {
            // Inserts seed entries
            return knex("cards").insert([
                { holder_name: "Guilherme", closing_date: "2020-01-12", due_date: "2020-01-19", type_id: 2, association_id: 2, bank_id: 260, user_id: 1, },
                { holder_name: "Guilherme", closing_date: null, due_date: null, type_id: 1, association_id: 2, bank_id: 341, user_id: 1, },
                { holder_name: "Raul", closing_date: null, due_date: null, type_id: 1, association_id: 2, bank_id: 168, user_id: 2, },
            ]);
        });
};