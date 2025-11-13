const express = require("express");
const router = express.Router();

const { getCommentByBlog, addComment, deleteComment } = require("../../controller/comment/commentController");
const validateToken = require("../../middleware/validateTokenHandler");

router.get("/getCommentByBlog", getCommentByBlog);
router.post("/addComment", validateToken, addComment);
router.delete("/deleteComment/:id", deleteComment);

module.exports = router;