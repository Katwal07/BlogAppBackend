const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const successResponse = require("../../utils/successResponse");
const ApiError = require("../../utils/apiError");

const prisma = new PrismaClient();


const toggleLike = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if (!userId) throw new ApiError(401, "User not authenticated");

    const { blogId } = req.body;


    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, "Request body is required");
    }

    const existingLike = await prisma.like.findFirst({ where: { blogId, userId } });

    if (existingLike) {
        await prisma.like.delete({ where: { id: existingLike.id } });
        return successResponse(res, 200, "Blog unlike successfully");
    } else {
        await prisma.like.create({ data: { blogId, userId } });
        return successResponse(res, 200, "Blog like successfully");
    }
});

const getLikeCount = asyncHandler(async (req, res) => {
    
    const userId = req.user?.id || null;

    if (!userId) throw new ApiError(401, "User not authenticated");

    const blogId = req.params.id;

    const totalLikeCount = await prisma.like.count({
        where: { blogId: blogId },
    });

    let userLiked = false;

    if(userId){
        const existingLike = await prisma.like.findFirst({
            where: {blogId, userId},
        });
        userLiked = !!existingLike;
    }

    return successResponse(res, 200, "like count fetched successfully", {count: totalLikeCount, userLiked: userLiked});

});

module.exports = { toggleLike, getLikeCount };