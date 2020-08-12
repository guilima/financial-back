import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("products_manufacturers").del()
        .then(() => {
            // Inserts seed entries
            return knex("products_manufacturers").insert([
                { product_id: 1, manufacturer_id: 1 },
                { product_id: 2, manufacturer_id: 2 },
                { product_id: 3, manufacturer_id: 3 },
            ]);
        });
};
