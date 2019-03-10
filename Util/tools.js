// tools.js
// ========
// Global Variables
let str = [];
let textTweet = "";
let languageArray = [];
let lang = "";




//Twitter configuration
const twitter = require("twitter");
const twitterObj = new twitter({
  consumer_key: "Lim6uMrcPkBALUQgRBD1V3rfV",
  consumer_secret: "ebSngBktNp1tadIhtXXeB9iAGTHhfXIel6rT6mWakX621FInGS",
  access_token_key: "980755858563805185-IEDUsSkoU0yaVeLLD0TkffvaQfWo9ag",
  access_token_secret: "ONJDiyRhDsMCCBMK93ErGimK5BICKpXzM8VR4EEF4JtTk"
});

module.exports = {

  getTweets: (userName) => {
    //Get the tweets by user:
    twitterObj
      .get("statuses/user_timeline", userName)
      .then(stageOne => {
        let tweets = "";
        for (let i = 0; i < stageOne.length; i++) {
          tweets += stageOne[i].text;
          languageArray.push(stageOne[i].lang);
        }
        //GEt the most tweeted language
        let tweetLang = languageArray
          .sort(
            (a, b) =>
              languageArray.filter(v => v === a).length -
              languageArray.filter(v => v === b).length
          )
          .pop();
        if (tweetLang !== "" && !undefined) {
          lang = tweetLang;
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
  },
  bar: function() {
    // whatever
  }
};
