import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("categories").del()
        .then(() => {
            // Inserts seed entries
            return knex("categories").insert([
                { name: "Material Construção" },
                { name: "Presente" },
                { name: "Avulso" },
            ]);
        });
};