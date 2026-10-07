import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-mssql';

export const db = drizzle({
  connection: {
    server: process.env.DB_SERVER!,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
});