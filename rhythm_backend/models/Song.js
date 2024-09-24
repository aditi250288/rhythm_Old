const mongoose = require("mongoose");
//how to create model
//step 1: require mongoose
//step 2: create a mongoose schema (structure of user)
//Step 3: Create a model
const SongSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  thumbnail: {
    type: String,
    required: true,
  },

  track: {
    type: String,
    required: true,
  },

  artist: [{
    //need to change this to array later
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },]

});

const SongModel = mongoose.model("Song", SongSchema);

module.exports = SongModel;







  // Example usage
  //createUser('John', 'Doe', 'john@example.com', John12);
