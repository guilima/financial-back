import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("roles").del()
        .then(() => {
            // Inserts seed entries
            return knex("roles").insert([
                {name: 'user', description: 'View stats, analytics, and service configuration information for all services on an account.'},
            ]);
        });
};
