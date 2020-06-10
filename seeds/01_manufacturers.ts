import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("manufacturers").del()
        .then(() => {
            // Inserts seed entries
            return knex("manufacturers").insert([
                { name: "Telhanorte", description: "Casa de Material e Construção" },
                { name: "Lapa Embalagens", description: "Mercado de produtos básicos" },
                { name: "Cido Construtor", description: "Pedreiro Serviço Tercerizado" }
            ]);
        });
};