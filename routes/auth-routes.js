const express = require("express");
const authRoutes = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");

//Twitter configuration

const twitter = require("twitter");
const twitterObj = new twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

// @route   POST /auth/signup
// @desc    Register a new User using name, email and password
// @access  Public
authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  //If twitterusername is present then check that it exists
  if (req.body.twitterUsername) {
    let twitterUsername = "";
    twitterObj
      .get(
        `https://api.twitter.com/1.1/users/show.json?screen_name=${
          req.body.twitterUsername
        }`,
        false,
      )
      .then(twitterUser => {
        twitterUsername = req.body.twitterUsername;
        if (!username || !password || !email) {
          res
            .status(400)
            .json({ message: "Proporcione Usuario,Email y password" });
          return;
        }
        if (password.length < 7) {
          res.status(400).json({
            message: "El password debe tener al menos 8 caracteres.",
          });
          return;
        }
        User.findOne({ username }, (err, foundUser) => {
          if (err) {
            res.status(500).json({ message: "Username check went bad." });
            return;
          }

          if (foundUser) {
            res
              .status(400)
              .json({ message: "El usuario ya existe, elija otro por favor." });
            return;
          }
          const salt = bcrypt.genSaltSync(10);
          const hashPass = bcrypt.hashSync(password, salt);
          const aNewUser = new User({
            username: username,
            password: hashPass,
            email: email,
            twitterUsername: twitterUsername,
          });
          aNewUser.save(err => {
            if (err) {
              res.status(400).json({
                message: "Hubo un error al guardar en la base de datos",
              });
              return;
            }
            // Automatically log in user after sign up
            // .login() here is actually predefined passport method
            req.login(aNewUser, err => {
              if (err) {
                res
                  .status(500)
                  .json({ message: "No se pudó logear despúes del registro" });
                return;
              }

              // Send the user's information to the frontend
              // We can use also: res.status(200).json(req.user);
              res.status(200).json(aNewUser);
            });
          });
        });
      })
      .catch(err =>
        res.status(400).json({ message: "El usuario de twitter no existe" }),
      );
  } else {
    if (!username || !password || !email) {
      res.status(400).json({ message: "Proporcione Usuario,Email y password" });
      return;
    }
    if (password.length < 7) {
      res.status(400).json({
        message: "El password debe tener al menos 8 caracteres.",
      });
      return;
    }
    User.findOne({ username }, (err, foundUser) => {
      if (err) {
        res.status(500).json({ message: "Username check went bad." });
        return;
      }

      if (foundUser) {
        res
          .status(400)
          .json({ message: "El usuario ya existe, elija otro por favor." });
        return;
      }
      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(password, salt);
      const aNewUser = new User({
        username: username,
        password: hashPass,
        email: email,
      });
      aNewUser.save(err => {
        if (err) {
          res
            .status(400)
            .json({ message: "Hubo un error al guardar en la base de datos" });
          return;
        }
        // Automatically log in user after sign up
        // .login() here is actually predefined passport method
        req.login(aNewUser, err => {
          if (err) {
            res
              .status(500)
              .json({ message: "No se pudó logear despúes del registro" });
            return;
          }

          // Send the user's information to the frontend
          // We can use also: res.status(200).json(req.user);
          res.status(200).json(aNewUser);
        });
      });
    });
  }
});

// @route   POST /auth/login
// @desc    Login to the sisteman for a previously registered user
// @access  Public
authRoutes.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, theUser, failureDetails) => {
    if (err) {
      res.status(500).json({ message: "No se pudo autenticar" });
      return;
    }

    if (!theUser) {
      // "failureDetails" contains the error messages
      // from our logic in "LocalStrategy" { message: '...' }.
      res.status(401).json(failureDetails);
      return;
    }

    // save user in session
    req.login(theUser, err => {
      if (err) {
        res
          .status(500)
          .json({ message: "La sesión no se guardó correctamente." });
        return;
      }

      // We are now logged in (that's why we can also send req.user)
      res.status(200).json(theUser);
    });
  })(req, res, next);
});

// @route   POST /auth/logout
// @desc    Ends the current user session
// @access  Public
authRoutes.post("/logout", (req, res, next) => {
  // req.logout() is defined by passport
  req.logout();
  res.status(200).json({ message: "Se s!" });
});

// @route   POST /auth/loggedin
// @desc    Gets the current logged user if exists
// @access  Public
authRoutes.get("/loggedin", (req, res, next) => {
  // req.isAuthenticated() is defined by passport
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
    return;
  }
  res.status(403).json({ message: "Sin autorización para ver esta página" });
});

// @route   POST /auth/updateTwitter
// @desc    Gets the current logged user if exists
// @access  Public
authRoutes.post("/updateTwitter", (req, res) => {
  const userId = req.body.userId;
  const twitterUsername = req.body.twitterUsername;

  User.findOneAndUpdate(
    { _id: userId },
    { $set: { twitterUsername: twitterUsername } },
    { new: true },
  )
    .then(response => {
      res.status(200).json(response);
    })
    .catch(err => console.log(err));
});

module.exports = authRoutes;
