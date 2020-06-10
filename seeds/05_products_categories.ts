import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("products_categories").del()
        .then(() => {
            // Inserts seed entries
            return knex("products_categories").insert([
                { product_id: 1, category_id: 1 },
                { product_id: 2, category_id: 2 },
                { product_id: 3, category_id: 3 },
            ]);
        });
};
