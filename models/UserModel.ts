import * as Crypto from 'expo-crypto';

import { getDb } from './db';
import type { User } from './types';

function toHex(bytes: Uint8Array) {
    return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

async function hashPassword(password: string) {
    const saltBytes = await Crypto.getRandomBytesAsync(16);
    const salt = toHex(saltBytes);
    const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${salt}:${password}`
    );
    return `${salt}$${hash}`;
}

export async function listUsers() {
    const db = await getDb();
    const rows = await db.getAllAsync<User>(`
        SELECT user_id, username, password, created_at, updated_at
        FROM user
        ORDER BY username
    `);
    return rows;
}

export async function getUserById(userId: number) {
    const db = await getDb();
    const row = await db.getFirstAsync<User>(`
        SELECT user_id, username, password, created_at, updated_at
        FROM user
        WHERE user_id = ?
    `, [userId]);
    return row ?? null;
}

export async function insertUser(username: string, password: string) {
    const db = await getDb();
    const hashedPassword = await hashPassword(password);
    const result = await db.runAsync(`
        INSERT INTO user (username, password)
        VALUES (?, ?)
        `, [username, hashedPassword]);
    return result.lastInsertRowId;
}

export async function updateUser(userId: number, username: string, password: string) {
    const db = await getDb();
    const hashedPassword = await hashPassword(password);
    await db.runAsync(`
        UPDATE user
        SET username = ?, password = ?, updated_at = datetime('now')
        WHERE user_id = ?
        `, [username, hashedPassword, userId]);
}

export async function deleteUser(userId: number) {
    const db = await getDb();
    await db.runAsync(`
        DELETE FROM user
        WHERE user_id = ?
    `, [userId]);
}