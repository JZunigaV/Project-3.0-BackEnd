const passport = require("passport");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const parser = require("../configs/cloudinary");

//Models
const Profile = require("../models/Profile");
const User = require("../models/User");

var userIdGlobal = "";

//Test Route
router.get("/test", (req, res) => {
  return res.json({ msg: "Route working" });
});

// @route   GET  profile/
// @desc    Get current user profile
// @access  Private
router.get("/:id", (req, res) => {
  const userId = req.params.id;
  userIdGlobal = userId;

  if (!userId) {
    return res.statusCode(404).json({ msg: "user not found" });
  }
  Profile.findOne({ user: userId })
    .populate("user", ["username", "avatarUrl", "id"])
    .then(profile => {
      if (!profile) {
        res.json({ msg: "there is no profile for this user" });
        return;
      }
      res.status(200).json({ profile });
    })
    .catch(err => res.status(404).json(err));
});

// @route   POST  /profile
// @desc    Create or edit user profile
// @access  Private
router.post("/new", (req, res) => {
  let userId = req.body.id.id;
  if (!userId) {
    return res.statusCode(400).json({ msg: "bad request" });
  }

  const profileFields = {};
  profileFields.user = userId;

  if (!userId) {
    res.status(400).json({ err: "handle is required" });
  }

  if (req.body.handle && /^[A-Za-z0-9_\-]{1,20}/.test(req.body.handle))
    profileFields.handle = req.body.handle;
  if (req.body.location && req.body.location.length < 100)
    profileFields.location = req.body.location;
  if (req.body.bio && req.body.bio.length < 281)
    profileFields.bio = req.body.bio;

  //Social
  profileFields.facebook = req.body.facebook;
  profileFields.twitter = req.body.twitter;

  Profile.findOne({ user: userId })
    .then(profile => {
      if (profile) {
        //Update
        Profile.findOneAndUpdate(
          { user: userId },
          { $set: profileFields },
          { new: true }
        )
          .then(profile => {
            res.status(200).json({ profile });
          })
          .catch(err => res.status(400).json({ errors: err }));
      } else {
        //Create

        //Check if handle exists
        Profile.findOne({ user: userId })
          .then(profile => {
            if (profile) {
              res.status(400).json({ error: "That handle already exists" });
            }
            //Save Profile
            new Profile(profileFields).save().then(profile => {
              res.status(200).json({ profile });
            });
          })
          .catch(err => console.log(err));
      }
    })
    .catch(err => console.log(err));
});

// @route   POST  /profile
// @desc    updates
// @access  Private
router.post("/pictures", parser.single("picture"), (req, res, next) => {
  const userId = req.body.userId;
  const profileFields = {};

  profileFields.avatarUrl = req.file.url;

  User.findOneAndUpdate({ _id: userId }, { $set: profileFields }, { new: true })
    .then(response => {
      res.json({
        success: true,
        pictureUrl: req.file.url
      });
    })
    .catch(err => console.log(err));
});

// @route   POST  profile/addfavorites
// @desc    Adds a favoritemovie to the profile
// @access  Private
router.post("/addfavorites", (req, res) => {
  
  //Get the request body
  const userId = mongoose.Types.ObjectId(req.body.userId);
  const { title, release, overview, background } = req.body.movie;

  //Here we create the new Comment object with the data of req.body
  const newMovie = {
    title,
    release,
    overview,
    background
  };
  //Query
  const query = {
      user: userId
    },
    update = {
      $push: {
        favoriteMovies: newMovie
      }
    },
    options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    };

  //if the document is not found, then create a new one, else update comments and push the newComment
  Profile.findOneAndUpdate(query, update, options)
  .then(movie => {
    res.status(200).json({movie});
  })
  .catch(err => {
    res.status(400).json(err);
  });
});


// @route   POST  profile/favorites
// @desc    Gets the favorite movies for the user
// @access  Private
router.post("/favorites",(req,res) => {
  const userId = req.body.userId;
  Profile.findOne({user:userId})
  .then((favorites) => {
    const favoriteMovies = favorites.favoriteMovies;
    res.status(200).json({favoriteMovies})
  })
  .catch((err) => {
    res.status(400).json(err)
  })
})












module.exports = router;
