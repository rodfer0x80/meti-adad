import { MongoClient } from "mongodb";
import logger from "./logger.js";
import { config } from './config.js'; 

//const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = config;
const { DB_HOST, DB_PORT, DB_NAME } = config;

//const connectionString = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?authSource=admin`;
const connectionString = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
const client = new MongoClient(connectionString);

let databaseConnection;

const timeoutPromise = (ms) => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error("MongoDB connection timed out after 5 seconds."));
        }, ms);
    });
};

export async function connectToDatabase() {
    if (databaseConnection) {
        return databaseConnection; 
    }
    
    try {
        logger.info("Attempting to connect to MongoDB (Timeout: 5s)...");

        const conn = await Promise.race([
            client.connect(),
            timeoutPromise(5000) 
        ]);
        
        databaseConnection = conn.db(DB_NAME); 
        logger.info(`Successfully connected to MongoDB database: ${DB_NAME}`);
        return databaseConnection;
    } catch(e) {
        logger.error(`MongoDB connection failed: ${e.message}`);
        await client.close(); 
        throw e; 
    }
}

export function getDatabase() {
    if (!databaseConnection) {
        throw new Error("Database not connected. Call connectToDatabase() first.");
    }
    return databaseConnection;
}

export async function checkDatabaseStatus() { 
    if (!databaseConnection) {
        return { status: 'Disconnected', error: 'Database instance not initialized or connection failed at startup.' };
    }

    try {
        const result = await databaseConnection.admin().ping();
        
        if (result.ok === 1) {
            return { status: 'Connected', error: null };
        } else {
            return { status: 'Degraded', error: 'Ping response was not OK.' };
        }
    } catch (e) {
        return { status: 'Disconnected', error: e.message };
    }
}

export async function closeDatabaseConnection() {
    if (client) {
        await client.close();
        logger.info("MongoDB connection closed.");
    }
}
