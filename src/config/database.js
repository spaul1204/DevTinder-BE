const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://namastedev:oJdi8hMvbP5dXicz@namastenode.ujvqczg.mongodb.net/devTinder",
      {}
    );
    console.log("MongoDB connected");
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
