import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("manufacturers").del()
        .then(() => {
            // Inserts seed entries
            return knex("manufacturers").insert([
                { name: "Telhanorte" },
                { name: "Lapa Embalagens" },
                { name: "Cido Construtor" }
            ]);
        });
};