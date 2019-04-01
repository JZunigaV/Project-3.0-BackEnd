const express = require("express");
const authRoutes = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");

// @route   POST /auth/signup
// @desc    Register a new User using name, email and password
// @access  Public
authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  if (!username || !password || !email) {
    res.status(400).json({ message: "Provide username,password and email" });
    return;
  }

  if (password.length < 7) {
    res.status(400).json({
      message:
        "Please make your password at least 8 characters long for security purposes."
    });
    return;
  }

  User.findOne({ username }, (err, foundUser) => {
    if (err) {
      res.status(500).json({ message: "Username check went bad." });
      return;
    }

    if (foundUser) {
      res.status(400).json({ message: "Username taken. Choose another one." });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    const aNewUser = new User({
      username: username,
      password: hashPass,
      email: email
    });

    aNewUser.save(err => {
      if (err) {
        res
          .status(400)
          .json({ message: "Saving user to database went wrong." });
        return;
      }

      // Automatically log in user after sign up
      // .login() here is actually predefined passport method
      req.login(aNewUser, err => {
        if (err) {
          res.status(500).json({ message: "Login after signup went bad." });
          return;
        }

        // Send the user's information to the frontend
        // We can use also: res.status(200).json(req.user);
        res.status(200).json(aNewUser);
      });
    });
  });
});

// @route   POST /auth/login
// @desc    Login to the sisteman for a previously registered user
// @access  Public
authRoutes.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, theUser, failureDetails) => {
    if (err) {
      res
        .status(500)
        .json({ message: "Something went wrong authenticating user" });
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
        res.status(500).json({ message: "Session save went bad." });
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
  res.status(200).json({ message: "Log out success!" });
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
  res.status(403).json({ message: "Unauthorized" });
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
    { new: true }
  )
    .then(response => {
      res.json({
        success: true,
        pictureUrl: req.file.url
      });
    })
    .catch(err => console.log(err));
});

module.exports = authRoutes;
