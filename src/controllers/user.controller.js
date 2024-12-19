import { asyncHandler } from "../utils/asynhandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"


const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        //yaha mereko lg rha haii User hoga

        return {accessToken,refreshtoken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and Access tokens")
    }
}

const registerUser = asyncHandler(async (req,res)=>{
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
    let coverimageLocalPath;
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length() == 1){
        coverimageLocalPath = req.files.coverimage[0].path;
    }
    
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar is needed there is no avatar ");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverimage = await uploadOnCloudinary(coverimageLocalPath);
    
    if(!avatar){
        throw new ApiError(500,"avatar is needed cant find the on uploadoncloudinary")
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
    const {email,username,password} = req.body
    
    if(!username || !email){
        throw new ApiError(400,"username or email is required")
    }
    
    const user = User.findOne({
        $or:[{username},{email}]
    });

    if(!user){
        throw new ApiError(404,"user doesnot exist")
    }

    const isPasswordValid = await user.isPassowordCorrect(password);

    if(isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

   const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
    httpOnly : true,
    secure: true
   }

   return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
    new ApiResponse(200,{
        user:loggedInUser,
        accessToken,
        refreshToken
    }, "User logged In Successfully")
   )
})


const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true,
        }
    ) 
    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status()
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}