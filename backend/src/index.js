// require('dotenv').config()
import dotenv from 'dotenv'
import express from 'express'
import connectDB from './db/db.js';
dotenv.config()


connectDB()
const app = express();
app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})
