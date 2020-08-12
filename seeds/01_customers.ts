import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("customers").del()
        .then(() => {
            // Inserts seed entries
            return knex("customers").insert([
                { name: "Luiz" },
                { name: "Vania" },
            ]);
        });
};
