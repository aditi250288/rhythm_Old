const express = require("express");
const router = express.Router();
const passport = require("passport");
const Song = require("../models/Song");
const User = require("../models/User");
const Playlist = require("../models/Playlist");

// Helper function to escape special characters in regex
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Helper function for fuzzy search
function fuzzySearch(text) {
  const escapedText = escapeRegex(text);
  return new RegExp(escapedText.split('').join('.*'), 'i');
}

// Create a new song
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { name, thumbnail, track } = req.body;
      
      // Basic input validation
      if (!name || !thumbnail || !track) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const artist = req.User._id;
      const songDetails = { name, thumbnail, track, artist };
      const newSong = await Song.create(songDetails);

      return res.status(201).json({ data: newSong });
    } catch (error) {
      console.error("Error creating song:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all songs published by the current user
router.get(
  "/get/MySongs",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const currentUser = req.User;
      const songs = await Song.find({ artist: currentUser._id }).populate("artist");
      return res.status(200).json({ data: songs });
    } catch (error) {
      console.error("Error fetching user's songs:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all songs published by a specific artist
router.get(
  "/get/artist/:artistId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { artistId } = req.params;

    try {
      const artist = await User.findById(artistId);
      if (!artist) {
        return res.status(404).json({ error: "Artist does not exist" });
      }

      const songs = await Song.find({ artist: artistId });
      return res.status(200).json({ data: songs });
    } catch (error) {
      console.error("Error fetching artist songs:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get songs by name or artist name (fuzzy search)
router.get(
  "/search/:query",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { query } = req.params;

    try {
      const fuzzyRegex = fuzzySearch(query);

      const songs = await Song.find({
        $or: [
          { name: { $regex: fuzzyRegex } },
          { 'artist.firstName': { $regex: fuzzyRegex } },
          { 'artist.lastName': { $regex: fuzzyRegex } }
        ]
      }).populate({
        path: 'artist',
        select: 'firstName lastName'
      });

      return res.status(200).json({ data: songs });
    } catch (error) {
      console.error("Error searching songs:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;