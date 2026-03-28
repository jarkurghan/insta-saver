import { defineConfig } from "drizzle-kit";

const host = process.env.DB_HOST ?? "127.0.0.1";
const port = Number(process.env.DB_PORT ?? 5432);
const user = process.env.DB_USER ?? "";
const password = process.env.DB_PASSWORD ?? "";
const database = process.env.DB_NAME ?? "";

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: { host, port, user, password, database },
});
