import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { DB_PASSWORD } from "@/utils/constants";
import { DB_HOST } from "@/utils/constants";
import { DB_PORT } from "@/utils/constants";
import { DB_USER } from "@/utils/constants";
import { DB_NAME } from "@/utils/constants";

import * as schema from "./schema";

const host = DB_HOST;
const port = DB_PORT ? Number(DB_PORT) : undefined;
const user = DB_USER;
const password = DB_PASSWORD;
const database = DB_NAME;

if (!host || !port || !user || !password || !database) {
    throw new Error("Database env variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME) are not fully set");
}

export const sql = postgres({ host, port, username: user, password, database });
export const db = drizzle(sql, { schema });

export { isu, isg } from "./schema";
