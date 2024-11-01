import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connecDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n mongoDB connected DB_Host :: ${connectionInstance.connection.host}`);
    } catch (MongoError) {
        console.log("MONGODB ERROR :: ",MongoError);
        process.exit(1);
    }
}
export default connecDB;