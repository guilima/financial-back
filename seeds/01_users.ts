import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("users").del()
        .then(() => {
            // Inserts seed entries
            return knex("users").insert([
                { full_name: "Guilherme Lima", userName: "carvlim", email: "carvlim@gmail.com" },
                { full_name: "Raul Ferreira", userName: "raulfer", email: "raulfer@gmail.com" },
                { full_name: "Wagner Santos", userName: "santwag", email: "santwag@gmail.com" },
            ]);
        });
};