const express = require("express");
const passport = require("passport");
const Playlist = require("../models/Playlist");
const User = require("../models/User");
const Song = require("../models/Song");

const router = express.Router();

// Route 1: Create a playlist
router.post(
    "/create",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const currentUser = req.user;
            const { name, thumbnail, songs } = req.body;
            if (!name || !thumbnail || !songs) {
                return res.status(400).json({ err: "Insufficient data" });
            }
            const playlistData = {
                name,
                thumbnail,
                songs,
                owner: currentUser._id,
                collaborators: [],
            };
            const playlist = await Playlist.create(playlistData);
            const populatedPlaylist = await Playlist.findById(playlist._id).populate('songs');
            return res.status(200).json({ data: populatedPlaylist });
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Route 2: Get a playlist by ID
router.get(
    "/get/playlist/:playlistId",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const playlistId = req.params.playlistId;
            const playlist = await Playlist.findOne({ _id: playlistId })
                .populate("owner")
                .populate("songs");
            if (!playlist) {
                return res.status(404).json({ err: "Invalid ID" });
            }
            return res.status(200).json({ data: playlist });
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Get all playlists made by the current user
router.get("/api/playlist/get/me", passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
        const artistId = req.user._id;
        const playlists = await Playlist.find({ owner: artistId })
            .populate("owner")
            .populate("songs"); // Populate songs to include their details
        return res.status(200).json({ data: playlists });
    } catch (error) {
        console.error("Error fetching playlists:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Get all playlists made by an artist
router.get(
    "/get/artist/:artistId",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const artistId = req.params.artistId;
            const artist = await User.findOne({ _id: artistId });
            if (!artist) {
                return res.status(404).json({ err: "Invalid Artist ID" });
            }
            const playlists = await Playlist.find({ owner: artistId }).populate('songs');
            return res.status(200).json({ data: playlists });
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Add a song to a playlist
router.post(
    "/api/playlist/add/song",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const currentUser = req.user;
            const { playlistId, songId } = req.body;
            const playlist = await Playlist.findOne({ _id: playlistId });
            if (!playlist) {
                return res.status(404).json({ err: "Playlist does not exist" });
            }
            if (
                !playlist.owner.equals(currentUser._id) &&
                !playlist.collaborators.includes(currentUser._id)
            ) {
                return res.status(403).json({ err: "Not allowed" });
            }
            const song = await Song.findOne({ _id: songId });
            if (!song) {
                return res.status(404).json({ err: "Song does not exist" });
            }
            playlist.songs.push(songId);
            await playlist.save();
            const updatedPlaylist = await Playlist.findById(playlistId).populate('songs');
            return res.status(200).json({ data: updatedPlaylist });
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

module.exports = router;
