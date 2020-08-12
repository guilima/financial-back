import * as Knex from "knex";
import { scryptSync, randomBytes } from 'crypto';

export async function seed(knex: Knex): Promise<any> {
    const passwordSalt = randomBytes(32);
    // Deletes ALL existing entries
    return knex("logins").del()
        .then(() => {
            // Inserts seed entries
            return knex("logins").insert([
                { password_salt: passwordSalt, password_hash: scryptSync('A2ad1234', passwordSalt, 64, {N:1024}).toString('hex'), ip_address: '::1', user_id: 1 },
                { password_salt: passwordSalt, password_hash: scryptSync('A2ad1234', passwordSalt, 64, {N:1024}).toString('hex'), ip_address: '::1', user_id: 2 },
                { password_salt: passwordSalt, password_hash: scryptSync('A2ad1234', passwordSalt, 64, {N:1024}).toString('hex'), ip_address: '::1', user_id: 3 },
            ]);
        });
};
