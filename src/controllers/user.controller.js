import { asyncHandler } from "../utils/asynhandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser = asyncHandler(async (req,res)=>{
    console.log(req.body);
    const {fullName, username, email, password} = req.body;
    if([fullName,username,email,password].some((field) => field?.trim === "")){
        throw new ApiError(400,"all fields needed");
    }
    const existingUser = await User.findOne({
        $or: [{ username },{ email }]
    })
    if(existingUser){
        throw new ApiError(409,"user already exists")
    }
    //file uploaded by, to multer
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverimageLocalPath = req.files?.coverimage[0]?.path
    
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar is needed");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverimage = await uploadOnCloudinary(coverimageLocalPath);
    
    if(!avatar){
        throw new ApiError(500,"avatar is needed")
    }

    //db upload
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createduser = await User.findById(user._id)
    .select("-password -refreshToken");

    if(!createduser){
        throw new ApiError(500,"something went wrong while registering user")
    }
    
    return res.status(201).json(
        new ApiResponse(200, createduser, "success registered")
    )

})

const loginUser = asyncHandler(async (req,res)=>{
    res.status(200).json({
        message:"done login",
    })
})


export {
    registerUser,
    loginUser
}