import { sql } from 'kysely';

/** Selects the user name - prefers friendlyName, falls back to fullName */
export const userNameSelector = sql<string>`COALESCE(User.friendlyName, User.fullName)`.as('name');
