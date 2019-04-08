const passport = require("passport");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const parser = require("../configs/cloudinary");
const JustWatch = require("justwatch-api");

//Models
const Profile = require("../models/Profile");
const User = require("../models/User");

//Twitter configuration

const twitter = require("twitter");
const twitterObj = new twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
  // consumer_key: "Lim6uMrcPkBALUQgRBD1V3rfV",
  // consumer_secret: "ebSngBktNp1tadIhtXXeB9iAGTHhfXIel6rT6mWakX621FInGS",
  // access_token_key: "980755858563805185-IEDUsSkoU0yaVeLLD0TkffvaQfWo9ag",
  // access_token_secret: "ONJDiyRhDsMCCBMK93ErGimK5BICKpXzM8VR4EEF4JtTk",
});

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
    return res.status(404).json({ msg: "user not found" });
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
  let userId = mongoose.Types.ObjectId(req.body.id);
  if (!userId) {
    return res.status(400).json({ msg: "bad request" });
  }
  const profileFields = {};
  profileFields.user = userId;
  if (req.body.bio && req.body.bio.length < 281)
    profileFields.bio = req.body.bio;

  //Social
  if (req.body.twitterUsername) {
    profileFields.social = {};
    profileFields.social.twitter = req.body.twitterUsername;
    //Check if the twitter handle exits
    twitterObj
      .get(
        `https://api.twitter.com/1.1/users/show.json?screen_name=${
          req.body.twitterUsername
        }`,
        false
      )
      .then(twitterUser => {
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
                .catch(err => res.status(400).json({ msg: err }));
            } else {
              //Create

              //Check if user exists
              Profile.findOne({ user: userId })
                .then(profile => {
                  if (profile) {
                    res
                      .status(400)
                      .json({ error: "That handle already exists" });
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
      })
      .catch(err => {
        res.status(400).json({msg:"El usuario de twitter no existe"});
      });
  } else {
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
            .catch(err => res.status(400).json({ msg: err }));
        } else {
          //Create

          //Check if user exists
          Profile.findOne({ user: userId })
            .then(profile => {
              if (profile) {
                res.status(400).json({ msg: "That handle already exists" });
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
  }
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
  let { title, release, overview, background, posterPath } = req.body.movie;

  background = `http://image.tmdb.org/t/p/original/${background}`;

  //Here we create the new Comment object with the data of req.body
  const newMovie = {
    title,
    release,
    overview,
    background,
    posterPath
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
      res.status(200).json({ movie });
    })
    .catch(err => {
      res.status(400).json(err);
    });
});

// @route   POST  profile/deletefavorites
// @desc    deletes a favorite movie from the profile
// @access  Private
router.post("/deletefavorites", (req, res) => {
  const movieId = mongoose.Types.ObjectId(req.body.movie);
  const userId = mongoose.Types.ObjectId(req.body.userId);

  Profile.findOneAndUpdate(
    { user: userId },
    { $pull: { favoriteMovies: { _id: movieId } } },
    { safe: true, upsert: true }
  )
    .then(value => {
      res.status(200).json({ value });
    })
    .catch(err => {
      res.status(400).json({ err });
    });
});

// @route   POST  profile/favorites
// @desc    Gets the favorite movies for the user
// @access  Private
router.post("/favorites", (req, res) => {
  const userId = mongoose.Types.ObjectId(req.body.userId);
  Profile.findOne({ user: userId })
    .then(favorites => {
      if (favorites) {              
      const favoriteMovies = favorites.favoriteMovies;
      res.status(200).json({ favoriteMovies });
      }else{
        res.status(200).json({ "msg": "no hay favoritas aun" });
      }
      
    })
    .catch(err => {
      res.status(400).json(err);
    });
});

// @route   POST  profile/info
// @desc    Gets the service where to watch a movie
// @access  Private
router.post("/info", (req, res) => {
  const movieTitle = req.body.movieTitle;
  const movieRelease = req.body.movieRelease;
  const watchObj = new JustWatch({ locale: "es_MX" });
  watchObj
    .search({ query: movieTitle, release_year_from: movieRelease })
    .then(movies => {
      res.status(200).json(movies.items[0]);
    });
});

router.post("/providers", (req, res) => {
  const watch = new JustWatch({ locale: "es_MX" });
  watch
    .getProviders()
    .then(providers => {
      res.status(200).json(providers);
    })
    .catch(err => {
      res.status(400).json(err);
    });
});

module.exports = router;
