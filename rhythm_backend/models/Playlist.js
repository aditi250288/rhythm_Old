const mongoose = require("mongoose");
//how to create model
//step 1: require mongoose
//step 2: create a mongoose schema (structure of user)
//Step 3: Create a model

const Playlist = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  thumbnail: {
    type: String,
    required: true,
  },

  owner: {
    //need to change this to array later
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
  // square brackets indicates the array
  songs: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Song",
    },
  ],

  collaborators: [
    {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
  ],

  //1. Playlist madhe songs konte ahet
  //2. playlist che collaborator kon ahet
});

const PlaylistModel = mongoose.model("Playlist", Playlist);

module.exports = PlaylistModel;

// Example usage
//createUser('John', 'Doe', 'john@example.com', John12);
  