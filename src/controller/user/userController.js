const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const successResponse = require("../../utils/successResponse");
const ApiError = require("../../utils/apiError");
const sendOtpFunc = require("../../utils/sendOtpUtils");


const prisma = new PrismaClient();

// @desc Register User
// @route POST /api/user/register
// @access Public
const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!req.body || Object.keys(req.body).length == 0) {
        throw new ApiError(400, "Request body is required");
    }
    const missingFields = [];
    if (!username) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
        throw new ApiError(400, "Missing required fields", `${missingFields} is required`);
    }

    const userAvailable = await prisma.user.findFirst({
        where: { email: email }
    });

    if (userAvailable) {
        throw new ApiError(400, "User already exist with this email");
    }

    const userNameAvailable = await prisma.user.findFirst({
        where: { username: username }
    });

    if (userNameAvailable) {
        throw new ApiError(400, "User already exist with this username");
    }

    /// Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    console.log(`Hash password is: ${hashPassword}`);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashPassword,
        }
    });

    if (!user) {
        throw new ApiError(400, "User data is not valid");
    }

    return successResponse(res, 201, "user registered successfully", {
        id: user.id,
        username: user.username,
        email: user.email,
    });
});


// @desc Login User
// @route POST /api/user/login
// @access Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!req.body || Object.keys(req.body) == 0) {
        throw new ApiError(400, "Request body is required")
    }

    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
        throw new ApiError(400, "Missing required fields", `${missingFields} is required`);
    }

    const user = await prisma.user.findFirst({
        where: { email: email },
    });

    if (user.isEmailVerified !== true) {
        throw new ApiError(400, "Validation Error", "user must verifies his/her email");
    }

    const isMatchFound = user && await (bcrypt.compare(password, user.password));

    if (isMatchFound) {
        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user.id,
            },
        },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );
        res.status(200).json({ accessToken });
    } else {
        throw new ApiError(401, "Email or password is incorrect");
    }
});


// @desc Send OTP
// @route POST /api/user/sent-otp
// @access Public
const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email || Object.keys(req.body) == 0) {
        throw new ApiError(400, "Missing required fiells", `email is required`);
    }

    const user = await prisma.user.findFirst({
        where: { email: email },
    });

    if (!user) {
        throw new ApiError(400, "user is not registered");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;

    await prisma.user.update({
        where: { email },
        data: {
            otp: otp,
            otpExpiresAt: otpExpiresAt,
        }
    });

    await sendOtpFunc.sendOtpEmail(email, otp);

    return successResponse(res, 200, "OTP sent successfully", {
        email: email,
    });

});


// @desc Get all blog posts
// @route GET /api/user/profile
// @access Private
const profile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            avatarUrl: true,
            isEmailVerified: true,
            _count: {
                select: {
                    blogs: true, comments: true, likes: true,
                }
            },
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new ApiError(400, "user not found");
    }

    return successResponse(res, 200, "Profile fetched successfully", {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
        blogs: user._count.blogs,
        comments: user._count.comments,
        likes: user._count.likes,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
});

// @desc Register User
// @route POST /api/user/verify
// @access Public
const verify = asyncHandler(async (req, res) => {

    const { email, otp } = req.body;
    if (!req.body || Object.keys(req.body).length == 0) {
        throw new ApiError(400, "Request body is empty");
    }
    const user = await prisma.user.findFirst({
        where: { email: email },
    });
    if (!user || user.otp !== otp || user.otpExpiresAt < Date.now()) {
        throw new ApiError(400, "Invalid otp | otp expires");
    }

    await prisma.user.update({
        where: { email },
        data: {
            otp: null,
            otpExpiresAt: null,
            isEmailVerified: true,
        }
    });

    return successResponse(res, 200, "OTP verified successfully", {
        email: email,
    });

});


// @desc Forgot Password
// @route POST /api/user/forgotPassword
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
    res.json(req.user);
});


// @desc Reset Password
// @route POST /api/user/resetPassword
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
    res.json(req.user);
});

const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if (!userId) throw new ApiError(401, "User not authenticated");

    const { bio } = req.body || {};

    /// Prepare data to update.
    const dataToUpdate = {};

    if (bio) dataToUpdate.bio = bio;
    if (req.file) dataToUpdate.avatarUrl = `uploads/avatars/${req.file.filename}`;

    if (!req.body && !req.file){
        throw new ApiError(400, "no any data is provided to update");
    }

    const updateUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            avatarUrl: true,
            isEmailVerified: true,
            createdAt: true,
        },
    });

    return successResponse(res, 200, "Profile updated successfully", {
        id: updateUser.id,
        username: updateUser.username,
        email: updateUser.email,
        bio: updateUser.bio,
        avatarUrl: updateUser.avatarUrl,
        isEmailVerified: updateUser.isEmailVerified,
        createdAt: updateUser.createdAt,
        updatedAt: updateUser.updatedAt,
    });
});



module.exports = { register, login, profile, verify, forgotPassword, resetPassword, sendOtp, updateProfile }