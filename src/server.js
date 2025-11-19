const express = require("express");
const dotenv = require("dotenv");
const errorHandler = require('./middleware/errorHandler');
const cors = require("cors");
const blogRoute = require("./routes/blog/blogRoutes");
const userRoute = require("./routes/user/userRoutes");
const commentRoute = require("./routes/comment/commentRoutes");
const likeRoute = require("./routes/likes/likeRoutes");
const ApiError = require("./utils/apiError");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { Server } = require("socket.io");
const { createServer } = require("http");
// const { join } = require('node:path');


const prisma = new PrismaClient();

/// So that it will take the config values.
dotenv.config();


/// We create the app.
const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"], 
    credentials: true,
  }
});

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

io.use((socket, next)=> {});


io.on("connection", (socket)=> {
  console.log("User connected");
  console.log("id", socket.id);

  socket.on("message", (data)=> {
    console.log(data);
    //io.emit("receive-message", data);
    //socket.broadcast.emit("receive-message", data);
    //io.to(data.room).emit("receive-message", data.message);
  });

  /// Listening to the event.
  socket.on("join-room", (room)=> {
    socket.join(room);
    console.log(`User joined the room ${room}`);
  });

  /// Listening to the event.
  socket.on("disconnect", ()=> {
    console.log("User disconnected");
  });
});

/// Error handling middleware.
app.use(errorHandler);



/// Run the server
server.listen(port, () => console.log(`Server running on http://localhost:${port}`));

