const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const initialiseSocket = require("./utils/socket");
require("dotenv").config();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const http = require("http");
const server = http.createServer(app);

initialiseSocket(server);

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const requestRoutes = require("./routes/requests");
const userRoutes = require("./routes/user");
const chatRouter = require("./routes/chat");

app.use("/", authRoutes);
app.use("/", profileRoutes);
app.use("/", requestRoutes);
app.use("/", userRoutes);
app.use("/", chatRouter);

//GET all the users from the db
app.get("/feed", async (req, res) => {
  try {
    await User.find({}).then((users) => {
      res.send(users);
    });
  } catch (err) {
    res.status(400).send("Something went wrong!", err);
  }
});

app.delete("/user", async (req, res) => {
  try {
    console.log(req.body.id);
    await User.findByIdAndDelete(req.body.id);
    res.send("User deleted succesfully");
  } catch (err) {
    res.status(400).send(err);
  }
});

app.patch("/user/:id", async (req, res) => {
  console.log(req.body);
  const data = req.body;

  try {
    const ALLOWED_UPDATES = ["gender", "about", "age", "photoUrl", "skills"];
    Object.keys(data).forEach((item) => {
      if (!ALLOWED_UPDATES.includes(item)) {
        throw new Error(`Update not allowed for ${item}`);
      }
    });
    const id = req.params?.id;
    await User.findByIdAndUpdate(id, data, {
      runValidators: true,
    });
    console.log("data ", data);

    res.send("User updated succesfully");
  } catch (err) {
    res.status(400).send("update failed " + err);
  }
});

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected", err);
  });
