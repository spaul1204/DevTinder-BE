const express = require("express");
const userAuth = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user.id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const ALLOWED_STATUS = ["interested", "ignored"];
      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({ message: "Invalid status type" });
      }

      //check if toUser exists
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({ message: "User not found" });
      }
      //check if a connection request already exists
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection request already exists" });
      }
      //save in db
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();
      let message;
      if (status === "interested") {
        message = "Connection request sent";
      } else {
        message = "Connection request ignored";
      }
      res.json({ message, data });
    } catch (err) {
      res.status(400).send("error sending request " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { requestId, status } = req.params;

      //validate status in params
      const ALLOWED_STATUS = ["accepted", "rejected"];
      if (!ALLOWED_STATUS.includes(status)) {
        throw new Error("Invalid status type");
      }
      //request id should be present in db
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser.id,
        status: "interested",
      });
      if (!connectionRequest) {
        throw new Error("Connection request not found");
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.status(200).json({ message: "Connection request " + status, data });
    } catch (err) {
      console.log(err.message);
      res.status(400).json({ message: err.message });
    }
  }
);
module.exports = requestRouter;
