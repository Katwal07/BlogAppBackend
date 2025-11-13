///MongoDB Connection

// const mongoose = require("mongoose");

// const connectDb = async () => {
//     try {
//         const connect = await mongoose.connect(process.env.CONNECTION_STRING);
//         console.log(
//             "Database connected:",
//             connect.connection.host,
//             connect.connection.name,
//         );
//     } catch (error) {
//         console.log("Error while connecting database",error);
//         process.exit(1);
//     }
// }

// module.exports = connectDb;

/// Postgres database connection

const pkg = require("pg");
const dotenv = require("dotenv").config();
const { Pool } = pkg;

console.log(`DB Password is: ${process.env.DB_PASSWORD}`);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on("connect", ()=> {
    console.log("Connection pool established with database");
});

module.exports = pool;