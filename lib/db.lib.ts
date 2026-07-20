import { Pool } from "pg";
import fs from "fs";
import url from "url";

const globalForPool = global as unknown as {
  pool: Pool | undefined;
};

export const pool =
  globalForPool.pool ||
  new Pool({
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "password",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || "local_db",
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: true,
            ca: fs.readFileSync(
              url.fileURLToPath(new URL("../certs/ca.pem", import.meta.url)),
            ),
          }
        : false,
  });

if (process.env.NODE_ENV !== "production") globalForPool.pool = pool;
