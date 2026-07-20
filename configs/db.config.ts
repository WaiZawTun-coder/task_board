import fs from "fs";
import pg from "pg";
import url from "url";

import dotenv from "dotenv";
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

const config: pg.ClientConfig = {
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "password",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME || "local_db",
  ssl: isProd
    ? {
        rejectUnauthorized: true,
        ca: fs.readFileSync(
          url.fileURLToPath(new URL("../certs/ca.pem", import.meta.url)),
        ),
      }
    : false,
};

const client = new pg.Client(config);

async function connectDB() {
  try {
    await client.connect();

    const result = await client.query("SELECT version();");

    console.log("DB Version:", result.rows[0].version);

    await client.end();
  } catch (err) {
    console.error("DB Error:", err);
  }
}

connectDB();
