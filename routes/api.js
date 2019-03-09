const express = require("express");
const router = express.Router();

// Global Variables
let str = [];
let textTweet = "";


//Twitter configuration
const twitter = require("twitter");
const twitterObj = new twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
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
router.post("/personality/:twitterUsername", (req,res, next) => {

  const userName = {
    from: req.params.twitterUsername,
    count:100
  }

  //Get the tweets by user:
  twitterObj.get("search/tweets.json", userName)
  .then((stageOne) => {

      const tweets = "";
      for (let i   = 0; i < stageOne.statuses.length; i++) {
        tweets += stageOne.statuses[i].text;
      }

      return (textTweet = tweets);
  });




  res.json({msg:"hola"})

});







router.get("/version", (req, res, next) => {

  res.json({ TwitterVersion: twitterObj.VERSION, IbmVersion: personalityInsights.serviceVersion });
});




module.exports = router;
