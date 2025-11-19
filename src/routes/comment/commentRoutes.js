const express = require("express");
const router = express.Router();

const { getCommentByBlog, addComment, deleteComment } = require("../../controller/comment/commentController");
const validateToken = require("../../middleware/validateTokenHandler");

router.get("/getCommentByBlog/:id",validateToken, getCommentByBlog);
router.post("/addComment", validateToken, addComment);
router.delete("/deleteComment/:id",validateToken, deleteComment);

module.exports = router;