const HOST = process.env.HOST || '127.0.0.1';
const PORT = parseInt(process.env.PORT, 10) || 5000;

export const config = { 
    HOST,
    PORT,
};

