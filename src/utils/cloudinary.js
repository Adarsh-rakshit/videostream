import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath){
            console.log("error in uploadonCloudinary because of no local file")
            return null
        }
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        // file has been uploaded successful
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.log("error happened in cloudinary service :: " ,error);
        fs.unlinkSync(localFilePath) //remove the files from local storage
        return null;
    }
}

export {uploadOnCloudinary} 