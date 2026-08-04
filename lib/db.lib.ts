import { Pool, types } from "pg";
import fs from "fs";
import url from "url";

const globalForPool = global as unknown as {
  pool: Pool | undefined;
};

types.setTypeParser(types.builtins.INT8, Number);

export const pool =
  globalForPool.pool ||
  new Pool({
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "admin",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || "task_board",
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: true,
            ca: process.env.PEM?.replace(/\\n/g, "\n") || "",
          }
        : false,
  });

if (process.env.NODE_ENV !== "production") globalForPool.pool = pool;
