const express = require("express");
const router = express.Router();
const passport = require("passport");
const Song = require("../models/Song");
const User = require("../models/User");

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { name, thumbnail, track } = req.body;
      const artist = req.user._id; // Assuming the authenticated user is the artist

      const songDetails = { name, thumbnail, track, artist };
      const newSong = await Song.create(songDetails);

      return res.status(201).json(newSong);
    } catch (error) {
      console.error("Error creating song:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

//get route to get all songs I have published.
router.get(
  "/get/MySongs",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const currentUser = req.user;
      // we need to get all songs where artists id == currentUser._id
      const songs = await Song.find({ artist: currentUser._id }).populate("artist");
      return res.status(200).json({ data: songs });
    } catch (error) {
      console.error("Error fetching user's songs:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

//get routes to get all songs any artist has published
//I will send the artist id and i want to see all songs that artist has published.
router.get(
  "/get/artist/:artistId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { artistId } = req.params;

    try {
      //we can check if the artist exists or not
      const artist = await User.findById(artistId);
      if (!artist) {
        return res.status(404).json({ err: "Artist does not exist." });
      }

      const songs = await Song.find({ artist: artistId });
      return res.status(200).json({ data: songs });
    } catch (error) {
      console.error("Error fetching artist songs:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

//get route to get a single song by name
router.get(
  "/get/songName/:songName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { songName } = req.params;

    try {
      //pattern matching in mongodb check that if time permits
      const songs = await Song.find({ name: songName });
      return res.status(200).json({ data: songs });
    } catch (error) {
      console.error("Error fetching songs by name:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;