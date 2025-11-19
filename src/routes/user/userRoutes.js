const express = require("express");
const router = express.Router();

const { register, login, profile, verify, forgotPassword, resetPassword, sendOtp, updateProfile } = require("../../controller/user/userController");
const validateToken = require("../../middleware/validateTokenHandler");
const upload = require("../../utils/imageUploadUtil");

router.post("/user/register", register);
router.post("/user/login", login);
router.post("/user/sent-otp", sendOtp);
router.post("/user/verify", verify);
router.put("/user/forgotPassword", forgotPassword);
router.put("/user/resetPassword", resetPassword);
router.get("/user/profile", validateToken, profile);
router.put("/user/profile", validateToken, upload.single("avatar"), updateProfile)

module.exports = router;