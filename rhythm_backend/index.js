const express = require("express");
const mongoose = require("mongoose");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/song");
const playlistRoutes = require("./routes/playlist");
const spotifyRoutes = require("./routes/Spotify");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = 5000;

const corsOptions = {
    origin: 'http://localhost:3000', // or your frontend URL
    credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use('/api/spotify', spotifyRoutes);

// Connect MongoDB to our node app
const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://aditiapte88:" + process.env.PWD + "@db.axgi0.mongodb.net/?retryWrites=true&w=majority&appName=Db",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1);
    }
};

// Setup passport-jwt
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET || "thisKeyIsSupposedToBeSecret";
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({ _id: jwt_payload.identifier })
        .then(user => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch(err => {
            return done(err, false);
        });
}));

// API routes
app.get("/", (req, res) => {
    res.send("Hello World");
});

// Debug logging middleware
const debugLogger = (routeName) => (req, res, next) => {
    console.log(`${routeName} route hit:`, req.url);
    next();
};

app.use("/api/auth", authRoutes);
app.use("/api/song", songRoutes);
app.use("/api/playlist", playlistRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error details:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log("App is running on port " + port);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
    }
};

startServer();