import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("tags").del()
        .then(() => {
            // Inserts seed entries
            return knex("tags").insert([
                { name: "Alvenaria" },
                { name: "Eletricista" },
            ]);
        });
};
