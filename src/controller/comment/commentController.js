const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const successResponse = require("../../utils/successResponse");
const ApiError = require("../../utils/apiError");

const prisma = new PrismaClient();

const addComment = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if (!userId) throw new ApiError(401, "User not authenticated");

    const { blogId, content } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, "Request body is required");
    }

    if (!content) throw new ApiError(400, "Comment cannot be empty");

    const comment = await prisma.comment.create({
        data: {
            content,
            userId,
            blogId,
        },
        include: {
            user: {
                select: {
                    username: true,
                    avatarUrl: true,
                }
            }
        }
    });

    return successResponse(res, 201, "comment is added", comment);
});

const getCommentByBlog = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if (!userId) throw new ApiError(403, "user is not authenticate");

    const blogId = req.params.id;

    if (!blogId) throw new ApiError(404, "Blog id is missing");

    const comment = await prisma.comment.findMany({
        where: { blogId: blogId },
        include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!comment || comment.length === 0) {
        return successResponse(res, 200, "No comments found for this blog", []);
    }

    return successResponse(res, 200, "Blog comment founded", comment);
});

const deleteComment = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const commentId = req.params.id;

    if (!userId) throw new ApiError("401", "user is not authenticated");

    if (!commentId) throw new ApiError("404", "comment id is missing");

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (comment.userId != userId) throw new ApiError(403, "user is not authorized to delete other comment");

    await prisma.comment.delete({ where: { id: commentId } });

    return successResponse(res, 200, "comment deleted successfully", comment);
});

module.exports = { addComment, getCommentByBlog, deleteComment }