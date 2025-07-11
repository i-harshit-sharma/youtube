import dotenv from 'dotenv'
import connectDB from './db/db.js';
import { app } from './app.js';
dotenv.config()


connectDB().
then(()=>{
    app.on("error",(error)=>{
        console.error(error)
        throw error
    })
    app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT || 3000}`)
})
}).
catch((err)=>{
    console.log("MongoDB connection failed")
})

