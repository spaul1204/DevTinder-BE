const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignupData } = require("./utils/validation");
const app = express();
const validator = require("validator");
const cookieParser = require("cookie-parser");
const userAuth = require("./middleware/auth");

app.use(express.json());
app.use(cookieParser());

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

app.post("/signup", async (req, res) => {
  try {
    //validate the data
    validateSignupData(req);

    const { firstName, lastName, emailId, password } = req.body;

    //encrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    //saving the user
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();
    res.send("User added succesfully");
  } catch (err) {
    res.status(400).send("error adding user ", err);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    //validation check
    if (!emailId || !password) {
      res.status(400).send("email and password are required");
    }

    if (!validator.isEmail(emailId)) {
      res.status(400).send("Email Id is not valid");
    }
    //finding user
    const user = await User.findOne({ emailId });
    //checking if user exists
    if (!user) {
      res.status(400).send("Invalid credentials");
    }

    //comparing password
    const isPasswordMatch = await user.validatePassword(password);
    
    if (!isPasswordMatch) {
      res.status(400).send("Invalid credentials");
    } else {

      //create a jwt token
      const token = await user.getJWT();

      res.cookie("token", token);
      res.status(200).send("login successful");
    }
  } catch (err) {
    res.status(400).send("error logging user in", err);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const { user } = req;
    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(400).send("error fetching user", err);
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
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected", err);
  });
