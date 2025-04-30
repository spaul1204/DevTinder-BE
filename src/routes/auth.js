const express = require("express");
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");

authRouter.post("/signup", async (req, res) => {
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
    console.log(err.message);
    res.status(400).send("error adding user " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
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
      res.status(200).json({ message: "login successful", data: user });
    }
  } catch (err) {
    res.status(400).send("error logging user in", err);
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).send("logout successful");
});

module.exports = authRouter;
