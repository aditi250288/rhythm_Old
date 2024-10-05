const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true, // Adding index for optimization
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true, // Adding index for optimization
  },
  password: {
    type: String,
    required: true, // Password is required
  },
  likedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
  }],
  likedPlaylists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
  }],
  subscribedArtists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
  }],
});

// Remove sensitive information like password from the output
userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.password;
    return ret;
  },
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
