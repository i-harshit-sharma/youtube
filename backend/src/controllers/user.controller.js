import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import [uploadToCloudinary] from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req,res)=>{
    //Get user data
    const {username,email,fullname,password} =req.body
    //Validation
    if(
        [fullname,email,username,password].some((item)=>{
            return item?.trim() === ""
        })
    ){
        throw new ApiError(400,"All fields are required")
    }
    //Unique registration
    username = username.tolowerCase();   
    email = email.tolowerCase();   
    const existingUser =  await User.findOne({
        $or:[{username}, {email}]
    })
    if(existingUser){
        throw new ApiError(409,"User with email or username already exists")
    }
    //Check file for images, avtar,
    console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File is missing")
    }
    //upload to cloudinary
    const avatar = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar File is missing")
    }
    console.log(avatar)
    //create user
    const user = User.create({
        fullname,
        avatar.url,
        coverImage?.url || "",
        email,
        password,
        username
    })
    // remove password and refresh token 
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    // check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    // return res
    return res.status(201).json(new ApiResponse(200,"User registered successfully",createdUser))

})

export {registerUser}