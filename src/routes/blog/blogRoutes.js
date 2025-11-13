const express = require('express');
const router = express.Router();

const {getAllBlogs, postBlog, updateBlog, getBlog, deleteBlog} = require("../../controller/blog/blogController");
const validateToken = require('../../middleware/validateTokenHandler');
const upload = require("../../utils/imageUploadUtil");


router.get("/getAllBlogs",validateToken, getAllBlogs);
router.post("/postBlog", validateToken, upload.single('blogImage'), postBlog);
router.get("/blog/:id", validateToken, getBlog);
router.put("/blog/:id", validateToken, updateBlog);
router.delete("/blog/:id", validateToken, deleteBlog);

module.exports = router;