const express = require("express");
const dotenv = require("dotenv");
const errorHandler = require('./middleware/errorHandler');
const cors = require("cors");
const blogRoute = require("./routes/blog/blogRoutes");
const userRoute = require("./routes/user/userRoutes");
const commentRoute = require("./routes/comment/commentRoutes");
const likeRoute = require("./routes/likes/likeRoutes");

/// So that it will take the config values.
dotenv.config();


/// We create the app.
const app = express();

/// We decide a port.
const port = process.env.PORT || 3000;

// Middleware logging BEFORE everything
app.use((req, res, next) => {
  console.log('\n=== NEW REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Path:', req.path);
  next();
});

/// Middleware
///so that we can parse the json request.
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log('Body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

/// Routes
app.use("/api", blogRoute);
app.use("/api", userRoute);
app.use("/api", commentRoute);
app.use("/api", likeRoute);

/// Error handling middleware.
app.use(errorHandler);

/// Run the server
app.listen(port, ()=> console.log(`Server running on http://localhost:${port}`));