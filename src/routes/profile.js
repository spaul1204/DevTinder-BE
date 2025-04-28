const express = require("express");
const userAuth = require("../middleware/auth");
const { validateProfileData } = require("../utils/validation");
const User = require("../models/user");
const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const { user } = req;
    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(400).send("error fetching user " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    console.log("req ", req.body);
    const isEditAllowed = validateProfileData(req.body);
    if (!isEditAllowed) {
      throw new Error("Editing not allowed");
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res
      .status(200)
      .json({
        message:
          loggedInUser.firstName +
          " :your profile has been updated successfully",
        data: loggedInUser,
      });
  } catch (err) {
    console.log(err);
    res.status(400).send("error editing user " + err.message);
  }
});


module.exports = profileRouter;
