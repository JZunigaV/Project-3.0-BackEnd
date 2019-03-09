const express = require("express");
const router = express.Router();
require("dotenv").config();

// Global Variables
let str = [];
let textTweet = "";
let tweetLanguage = [];
let lang = "";

//Twitter configuration
const twitter = require("twitter");
const twitterObj = new twitter({
  consumer_key: "Lim6uMrcPkBALUQgRBD1V3rfV",
  consumer_secret: "ebSngBktNp1tadIhtXXeB9iAGTHhfXIel6rT6mWakX621FInGS",
  access_token_key: "980755858563805185-IEDUsSkoU0yaVeLLD0TkffvaQfWo9ag",
  access_token_secret: "ONJDiyRhDsMCCBMK93ErGimK5BICKpXzM8VR4EEF4JtTk"
});

//Personality insigths configuration
const PersonalityInsightsV3 = require("watson-developer-cloud/personality-insights/v3");

const personalityInsights = new PersonalityInsightsV3({
  version_date: process.env.VERSION_DATE,
  iam_apikey: process.env.IAM_API_KEY,
  url: process.env.URL
});

/* GET home page */
router.get("/", (req, res, next) => {
  res.json({
    msg: "itworks"
  });
});

// @route   POST /api/personality/:twitterUsername
// @desc    Make a request to the personality insights api using the twitter userName and return the analysis
// @access  Private
router.post("/personality/:twitterUsername", (req, res, next) => {
  const userName = {
    from: req.params.twitterUsername,
    count: 100
  };

  //Get the tweets by user:
  
  twitterObj.get(
    "statuses/user_timeline",
    { screen_name: "PostMalone", count: 100 })
    .then(stageOne => {
      let tweets = "";

      for (let i = 0; i < stageOne.statuses.length; i++) {
        tweets += stageOne.statuses[i].text;
        tweetLanguage.push(stageOne.statuses[i].lang);
      }

      let isEqual = tweetLanguage.every((val, i, arr) => val === arr[0]);
      if (isEqual && !undefined) {
        lang = tweetLanguage[0];
      } else {
        lang = "en";
      }

      console.log(lang);

      textTweet = tweets;
      return (textTweet = tweets);
    })
    .catch(err => {
      console.log(err);
    })

    //Watson Request
    .then(stageTwo => {
      let paramsWatson = {
        // Get the content items from the JSON file.
        text: stageTwo,
        consumption_preferences: true,
        raw_scores: true,
        headers: {
          "accept-language": "eng",
          "Content-Language": lang,
          accept: "application/json"
        }
      };
      return paramsWatson;
    })

    .then(stageThree => {
      personalityInsights.profile(stageThree, (error, response) => {
        if (error) {
          res.json({ error: error });
        } else {
          res.json(response);
        }
      });
    })
    .catch(err => {
      console.log(err);
    });
});

router.get("/tweets", (req, res) => {
  
  // https://dev.twitter.com/rest/reference/get/statuses/user_timeline
  twitterObj.get(
    "statuses/user_timeline",
    { screen_name: "PostMalone", count: 20 },
    function(error, tweets, response) {
      if (!error) {
        res.status(200).json({ title: "Express", tweets: tweets });
      } else {
        res.status(500).json({ error: error });
      }
    }
  );
});

router.get("/version", (req, res, next) => {
  res.json({
    TwitterVersion: twitterObj.VERSION,
    IbmVersion: personalityInsights.serviceVersion
  });
});

module.exports = router;
