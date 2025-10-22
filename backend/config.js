'use strict';

const config = {
    HOST: process.env.HOST || '127.0.0.1', 
    PORT: parseInt(process.env.PORT, 10) || 5000,
};

Object.freeze(config);

module.exports = config;
