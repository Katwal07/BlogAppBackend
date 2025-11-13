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
        select:{
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        }
      },
      _count: {
        select:{
          comments: true,
          likes: true,
        }
      }
    },
    orderBy:{createdAt: "desc"},
  });
  successResponse(res, 200, "Blogs fetched successfully", blogs);
});

// @desc Post blog posts
// @route POST /api/blogs
// @access Private
const postBlog = asyncHandler(async (req, res) => {
  const userId  = req.user.id;
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

  const slug = title.toLowerCase().replace(/\s+/g, "-") + "_"+ Date.now();

  const newBlog = await prisma.blog.create({
    data:{
      title,
      slug,
      content,
      imageUrl: req.file ? `uploads/blogs/${req.file.filename}` : null,
      userId,
      published: true,
    }
  });

  successResponse(res, 201, "Blog created successfully", newBlog);
});

// @desc Get individual blog posts
// @route GET /api/blogs/:id
// @access Private
const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await prisma.blog.findUnique({ where: { id: parseInt(id) } });

  if (!blog) {
    res.status(404);
    throw new Error("Blog post not found");
  }

  if (blog.userId.toString() != req.user.id) {
    res.status(403);
    throw new Error("user don't have permission to get other blog");
  }

  res.status(200).json(blog);
});

// @desc Update blog posts
// @route PUT /api/blogs/:id
// @access Private
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  const blog = await prisma.blog.findUnique({ where: { id: parseInt(id) } });

  if (!blog) {
    res.status(404);
    throw new Error("Blog post not found");
  }

  if (!req.body || Object.keys(req.body).length == 0) {
    res.status(400);
    throw new Error("Request body is required");
  }

  if (blog.userId.toString() != req.user.id) {
    res.status(403);
    throw new Error("user don't have permission to update other blog");
  }

  const updatedBlog = await prisma.blog.update(
    {
      where: { id: parseInt(id) },
      data: {
        name: name ?? blog.name,
        email: email ?? blog.email,
        phone: phone ?? blog.phone,
      }
    }
  );
  res.status(200).json(updatedBlog);
});

// @desc Delete blog posts
// @route DELETE /api/blogs/:id
// @access Private
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const blog = await prisma.blog.findUnique({ where: { id: parseInt(id) } });

  if (!blog) {
    res.status(404);
    return new Error("Blog not found");
  }

  if (blog.userId.toString() != req.user.id) {
    res.status(403);
    throw new Error("user don't have permission to delete other blog");
  }

  await prisma.blog.delete({ where: { id: parseInt(id) } });
  res.status(200).json({ message: "Blog post deleted successfully", id: req.params.id });
});

module.exports = { getAllBlogs, postBlog, getBlog, updateBlog, deleteBlog };
