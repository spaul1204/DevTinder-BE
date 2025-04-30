const express = require("express");
const userAuth = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
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

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    //get connections from userConnection db
    //check if profile fetched is not logged in user
    //check if profile is already not a connection
    //check if profile being fetched has not been ignored or rejected or interested by loggedin user
    //check if profile being fetched has not ignored or rejected or interested by logged in user
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;
    //all requests sent and recieved
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser.id }, { toUserId: loggedInUser.id }],
    });

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((each) => {
      hideUsersFromFeed.add(each.fromUserId.toString());
      hideUsersFromFeed.add(each.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser.id } },
      ],
    })
      .select(USER_DISPLAY_DATA)
      .skip(skip)
      .limit(limit);
    res.status(200).json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
module.exports = userRouter;
