const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const successResponse = require("../../utils/successResponse");
const ApiError = require("../../utils/apiError");

const prisma = new PrismaClient();

// @desc Get all blog posts
// @route GET /api/getAllBlogs
// @access Public
const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await prisma.blog.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        }
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
  return successResponse(res, 200, "Blogs fetched successfully", blogs);
});

// @desc Post blog posts
// @route POST /api/blogs
// @access Private
const postBlog = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, content } = req.body;

  if (!userId) throw new ApiError(401, "User not authenticated");

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError(400, "Req body is required");
  }

  const missingFields = [];
  if (!title) missingFields.push('title');
  if (!content) missingFields.push('content');

  if (missingFields.length > 0) {
    throw new ApiError(400, "Validation Failed", `${missingFields} is required`);
  }

  const slug = title.toLowerCase().replace(/\s+/g, "-") + "_" + Date.now();

  const newBlog = await prisma.blog.create({
    data: {
      title,
      slug,
      content,
      imageUrl: req.file ? `uploads/blogs/${req.file.filename}` : null,
      userId,
      published: true,
    }
  });

  return successResponse(res, 201, "Blog created successfully", newBlog);
});

// @desc Get individual blog posts
// @route GET /api/blogs/:id
// @access Private
const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "No blog id");

  const blog = await prisma.blog.findUnique({ where: { id: id } });

  if (!blog) throw new ApiError(400, "Blog not found")

  if (blog.userId != req.user.id) {
    throw new ApiError(403, "user don't have permission to get other blog");
  }

  return successResponse(res, 200, "blog fetched successfully", blog);
});

// @desc Update blog posts
// @route PUT /api/blogs/:id
// @access Private
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) throw new ApiError(400, "Invalid blog id");

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError(400, "No data provided for update");
  }

  const { title, content, imageUrl, } = req.body;

  const blog = await prisma.blog.findUnique({ where: { id: id } });

  if (!blog) {
    throw new ApiError(404, "Blog post not found");
  }

  if (blog.userId != req.user.id) {
    throw new ApiError(403, "user don't have permission to update other blog");
  }

  const updatedBlog = await prisma.blog.update(
    {
      where: { id: id },
      data: {
        ...(title && {title}),
        ...(content && {content}),
        ...(imageUrl && {imageUrl}),
      }
    }
  );
  return successResponse(res, 200, "blog updated successfully", updatedBlog);
});

// @desc Delete blog posts
// @route DELETE /api/blogs/:id
// @access Private
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Invalid blog id");

  const blog = await prisma.blog.findUnique({ where: { id: id } });

  if(!blog) throw new ApiError(404, "Blog not found");

  if (blog.userId != req.user.id) {
    throw new ApiError(403, "user don't have permission to delete other blogs");
  }

  await prisma.comment.deleteMany({where: {blogId: id}});
  await prisma.like.deleteMany({where: {blogId: id}});
  await prisma.blog.delete({ where: { id: id } });
  return successResponse(res, 200, "Blog deleted successfully", {id: req.params.id });
});

module.exports = { getAllBlogs, postBlog, getBlog, updateBlog, deleteBlog };
