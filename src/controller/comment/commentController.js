const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const successResponse = require("../../utils/successResponse");
const ApiError = require("../../utils/apiError");

const prisma = new PrismaClient();

const addComment = asyncHandler(async(req,res) => {
    const userId = req.user.id;

    if (!userId) throw new ApiError(401, "User not authenticated");

    const { blogId, content } = req.body;

    if (!req.body || Object.keys(req.body).length === 0){
        throw new ApiError(400,"Request body is required");
    }

    if (!content) throw new ApiError(400, "Comment cannot be empty");

    const comment = await prisma.comment.create({
        data:{
            content,
            userId,
            blogId,
        },
        include: {
            user:{
                select: {
                    username : true,
                    avatarUrl : true,
                }
            }
        }
    });

    successResponse(res, 201, "comment is added", comment);
});

const getCommentByBlog = asyncHandler (async(req, res)=> {});

const deleteComment = asyncHandler (async(req, res)=> {});

module.exports = { addComment, getCommentByBlog, deleteComment }