const express = require("express");
const userAuth = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();

const USER_DISPLAY_DATA = "firstName lastName age gender skills";
//get all the requests sent to the logged in user
userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    console.log(loggedInUser);
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_DISPLAY_DATA);

    res.status(200).json(connectionRequests);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      $or: [
        {
          status: "accepted",
          fromUserId: loggedInUser.id,
        },
        {
          status: "accepted",
          toUserId: loggedInUser.id,
        },
      ],
    })
      .populate("fromUserId", USER_DISPLAY_DATA)
      .populate("toUserId", USER_DISPLAY_DATA);

    const data = connections.map((each) => {
      if (each.fromUserId._id.toString() === loggedInUser.id.toString())
        return each.toUserId;
      else return each.fromUserId;
    });

    res.status(200).json({ data });
  } catch (e) {
    res.status(400).json({ message: err.message });
  }
});
module.exports = userRouter;
