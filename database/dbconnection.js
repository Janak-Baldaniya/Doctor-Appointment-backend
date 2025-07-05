import mongoose from "mongoose";

export const dbconnection = () => {
    mongoose.connect(process.env.MONGODB_URI,{
        dbName:"FULL_STACK_HOSPITAL_MANAGMENT_SYSTEM"
    }).then(()=>{
        console.log("Connected to database");
    }).catch((err)=>{
        console.log(`Error connecting to database: ${err}`);
    });
}