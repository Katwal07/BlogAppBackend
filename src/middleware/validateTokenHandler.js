const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;

    console.log("I am inside middleware");
    console.log(authHeader);

    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err){
                res.status(401);
                throw new Error("User is not authorized");
            }
            console.log(`Decoded user is: ${decoded.user}`);
            req.user = decoded.user;
            next();
        });
    }
    if (!token){
        res.status(401);
        throw new Error("token is missing");
    }
});

module.exports = validateToken;