const HOST = process.env.HOST || '127.0.0.1';
const PORT = parseInt(process.env.PORT, 10) || 5000;

const DB_USER = process.env.DB_USER || "user";
const DB_PASSWORD = process.env.DB_PASSWORD || "password";
const DB_HOST = process.env.DB_HOST || "localhost:27017";
const DB_NAME = process.env.DB_NAME || "adad_db";

export const config = {
  HOST,
  PORT,

  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
};

