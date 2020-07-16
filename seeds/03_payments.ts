import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("payments").del()
        .then(() => {
            // Inserts seed entries
            return knex("payments").insert([
                { date: new Date(2019, 7, 5), installment: 12, price: 23097.0000, product_manufacturer_id: 3, category_id: 1, wallet_id: 1 },
                { date: new Date(2019, 12, 15), installment: 0, price: 245.1244, description: "Compra realizada para abastecer o estoque", product_manufacturer_id: 2, category_id: 2, wallet_id: 1 },
                { date: new Date(2019, 7, 22), installment: 24, price: 42235.1277, product_manufacturer_id: 2, category_id: 3, wallet_id: 1 },
                { date: new Date(2020, 1, 11), installment: 0, price: 245.1244, product_manufacturer_id: 1, category_id: 1, wallet_id: 1 },
                { date: new Date(2020, 1, 9), installment: 1, price: 6000.1200, product_manufacturer_id: 1, category_id: 2, wallet_id: 1 },
                { date: new Date(2020, 2, 5), installment: 5, price: 12234.1200, product_manufacturer_id: 3, category_id: 3, wallet_id: 2 },
            ]);
        });
};