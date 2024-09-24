const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  password:{
    type: String,
    required: true,
    private: true,
  },

  lastName:{
    type: String,
    required: false,
  },

  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
    lowercase: true // Convert email to lowercase for consistency
  },

  username: {
    type: String,
    required: true,
    unique: true // Ensure username is unique
  },

 /* password: {
    type: String,
    required: true // Password is required
  },*/

  likedSongs: {
    type: [String],
    default: [] // Initialize as an empty array
  },

  likedPlaylists: {
    type: [String],
    default: [] // Initialize as an empty array
  },
  
  subscribedArtists: {
    type: [String],
    default: [] // Initialize as an empty array
  }
});


// Create the User model
const User = mongoose.model("User", userSchema);

// Export the User model
module.exports = User;