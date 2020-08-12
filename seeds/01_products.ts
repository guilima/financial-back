import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("products").del()
        .then(() => {
            // Inserts seed entries
            return knex("products").insert([
                { name: "Piso" },
                { name: "Caixa Papelão" },
                { name: "Serviço Terceirizado" },
            ]);
        });
};