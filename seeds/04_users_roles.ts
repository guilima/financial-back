import * as Knex from "knex";

export async function seed(knex: Knex): Promise<any> {
    // Deletes ALL existing entries
    return knex("users_roles").del()
        .then(() => {
            // Inserts seed entries
            return knex("users_roles").insert([
                { user_id: 1, role_id: 1 },
                { user_id: 2, role_id: 1 },
                { user_id: 3, role_id: 1 },
            ]);
        });
};
