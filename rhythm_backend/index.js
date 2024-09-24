//npm init : package.json - this is node project.
//npm i express: express js package install

const express = require("express");
const mongoose = require ("mongoose");
const JwtStrategy = require("passport-jwt").Strategy,
    ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require ("passport");
const User = require ("./models/User");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/Song");
const playlistRoutes = require("./routes/playlist");
require ("dotenv").config();
const cors = require("cors");
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());


//connect mongodb to our node app
// mongoose.connect() takes arguments : 1. which db to connect to (db url), 2. connection options

mongoose.connect
    ("mongodb+srv://aditiapte88:"+ process.env.PWD +"@db.axgi0.mongodb.net/?retryWrites=true&w=majority&appName=Db",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)

.then((x) => {
    console.log("connected to Mongo")
})
.catch(err => {
    console.error("Error connecting to MongoDB:", err.message);

});

//setup passport-jwt

let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "thisKeyIsSupposedToBeSecret";
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

    /*OLD CODE User.findOne({_id: jwt_payload.identifier}, function(err, user) {
        // done(error,doesTheUserExist)
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });*/
}));

//API : GET Type : / : return text "Hello world"

app.get("/", (req, res) => {
    //req - contains all the data for the request
    //res - contains all the data for response

    res.send("Hello World");

});

app.use("/auth", authRoutes);
app.use("/Song", songRoutes);
app.use("/playlist", playlistRoutes);

// now we want to tell express that our server will run on localhost:5000

app.listen(port, () => {
    console.log("app is running on port " + port);
})