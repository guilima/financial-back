import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("payments").del()
        .then(() => {
            // Inserts seed entries
            return knex("payments").insert([
                { date: new Date(2019, 7, 5), installment: 12, price: 23097.0000, type_id: 3, customer_bank_id: 1, product_manufacturer_id: 3, category_id: 1, wallet_id: 1 },
                { date: new Date(2019, 12, 15), installment: 0, price: 245.1244, type_id: 2, description: "Compra realizada para abastecer o estoque", customer_bank_id: 1, product_manufacturer_id: 2, category_id: 2, wallet_id: 1 },
                { date: new Date(2019, 7, 22), installment: 24, price: 42235.1277, type_id: 3, customer_bank_id: 1, product_manufacturer_id: 2, category_id: 3, wallet_id: 1 },
                { date: new Date(2020, 1, 11), installment: 0, price: 245.1244, type_id: 1, customer_bank_id: 2, product_manufacturer_id: 1, category_id: 1, wallet_id: 1 },
                { date: new Date(2020, 1, 9), installment: 1, price: 6000.1200, type_id: 1, customer_bank_id: 2, product_manufacturer_id: 1, category_id: 2, wallet_id: 1 },
                { date: new Date(2020, 2, 5), installment: 5, price: 12234.1200, type_id: 3, customer_bank_id: 3, product_manufacturer_id: 3, category_id: 3, wallet_id: 2 },
            ]);
        });
};