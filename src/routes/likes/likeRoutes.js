const express = require("express");
const router = express.Router();

const { toggleLike, getLikeCount } = require("../../controller/likes/likeController");
const validateToken = require("../../middleware/validateTokenHandler");

router.post("/toggleLike", validateToken, toggleLike);
router.get("/getLikeCount/:id",validateToken, getLikeCount);

module.exports = router;