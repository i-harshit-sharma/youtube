import {asyncHandler} from "../utils/AsyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {uploadToCloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"
import fs from "fs"

const generateAccessAndRefreshTokens = async (UserId)=>{
    try {
        const user = await User.findById(UserId)
        if(!user){
            throw new ApiError(404,"User not found")
        }
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()
        user.refreshToken = refreshToken
        user.save({validateBeforeSave: false})
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh tokens")
    }
}

const registerUser = asyncHandler(async (req,res)=>{
    //Get user data
    const {username,email,fullname,password} =req.body
    //Validation 
    // TOdo add size validation
    if(
        [fullname,email,username,password].some((item)=>{
            return (item?.trim() === "" || item === undefined) 
        })
    ){
        throw new ApiError(400,"All fields are required")
    }
    //Unique registration
    let newUsername = username?.toLowerCase(); 
    const existingUser =  await User.findOne({
        $or:[{username: newUsername}, {email}]
    })
    if(existingUser){
        throw new ApiError(409,"User with email or username already exists")
    }
    //Check file for images, avtar,
    const avatarLocalPath = req?.files?.avatar?.[0]?.path
    const coverImageLocalPath = req?.files?.coverImage?.[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File is missing")
    }
    //upload to cloudinary
    const avatar = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadToCloudinary(coverImageLocalPath)
    fs.unlinkSync(avatarLocalPath)
    fs.unlinkSync(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar File is missing")
    }
    //create user
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: newUsername
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

const loginUser = asyncHandler(async (req,res)=>{
    // get data
    // console.log(req.body)
    const {email,username, password} = req.body
    if(!username && !email ){
        throw new ApiError(400,"Username or email is required")
    }
    if(!password){
        throw new ApiError(400,"Password is required")
    }
    // find user
    const user = await User.findOne({$or:[{username},{email}]})

    if(!user){
        throw new ApiError(404, "User not found")
    }
    // password check
    console.log(password)
    const isPasswordCorrect = await user.isPasswordCorrect(password)
    console.log(isPasswordCorrect)
    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid user credentials")
    }
    // tokens
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
    // send
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).
    cookie("accessToken",accessToken,options).
    cookie("refreshToken",refreshToken,options).
    json(new ApiResponse(200,{user:loggedInUser, accessToken,refreshToken},"User logged in successfully"))

})

const logOutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken: undefined
        }        
    },{
        new: true
    })
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {},"Logged Out Successfully"))
})


export {registerUser, loginUser,logOutUser}