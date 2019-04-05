const express = require("express");
const router = express.Router();
require("dotenv").config();
const tmdb = require("tmdbv3").init("3c5bc5cac4d9c2e29d68ab73c21b1cfb");
const axios = require("axios");
// Global Variables
let lang = "";
//Twitter configuration
const twitter = require("twitter");
const twitterObj = new twitter({
  consumer_key: "nRPZ6UgsCsbxL5wQtO79DFnaI",
  consumer_secret: "gt7bZA26GlQviZd1miXNAhquLyBrwzHTTCFZ9JfeAKYDayBRQy",
  access_token_key: "90670132-wWnXubi7sDsokijLd5MagF51Fi2EJj01wPrmXicmz",
  access_token_secret: "bj1Q48nbWZUJLs8NsCMHMPOZm31BqE2YjL12GJdlDbxdT",
  // consumer_key: "Lim6uMrcPkBALUQgRBD1V3rfV",
  // consumer_secret: "ebSngBktNp1tadIhtXXeB9iAGTHhfXIel6rT6mWakX621FInGS",
  // access_token_key: "980755858563805185-IEDUsSkoU0yaVeLLD0TkffvaQfWo9ag",
  // access_token_secret: "ONJDiyRhDsMCCBMK93ErGimK5BICKpXzM8VR4EEF4JtTk",
});

//Personality insigths configuration
const PersonalityInsightsV3 = require("watson-developer-cloud/personality-insights/v3");
const personalityInsights = new PersonalityInsightsV3({
  version_date: process.env.VERSION_DATE,
  iam_apikey: process.env.IAM_API_KEY,
  url: process.env.URL,
});

/* GET home page */
router.get("/", (req, res, next) => {
  res.json({
    msg: "itworks",
  });
});

// @route   POST /api/personality/:twitterUsername
// @desc    Make a request to the personality insights api using the twitter userName and return the analysis
// @access  Private
router.post("/personality", (req, res, next) => {
  let languageArray = [];
  const userName = {
    screen_name: req.body.username,
    count: 200,
  };

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
      let tweetLang = "";
      tweetLang = languageArray
        .sort(
          (a, b) =>
            languageArray.filter(v => v === a).length -
            languageArray.filter(v => v === b).length,
        )
        .pop();
      if (tweetLang !== "" && tweetLang != undefined) {
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
          accept: "application/json",
        },
      };
      return paramsWatson;
    })
    .then(stageThree => {
      personalityInsights.profile(stageThree, (error, response) => {
        if (error) {
          res.json({
            error: error,
          });
        } else {
          res.json(response);
        }
      });
    })
    .catch(err => {
      console.log(err);
    });
});

// @route   POST /api/recommendedMovies
//@Params   username: Twitter username
// @desc    Make a request to the personality insights api using the twitter userName and return the recommended movie genres
// @access  Private
router.post("/recommendedMovies", (req, res, next) => {
  let languageArray = [];
  const userName = {
    screen_name: req.body.username,
    count: 200,
  };

  // //Get the tweets by user:
  twitterObj
    .get("statuses/user_timeline", userName)
    .then(stageOne => {
      let tweets = "";
      for (let i = 0; i < stageOne.length; i++) {
        tweets += stageOne[i].text;
        languageArray.push(stageOne[i].lang);
      }
      //GEt the most tweeted language
      let tweetLang = "";
      tweetLang = languageArray
        .sort(
          (a, b) =>
            languageArray.filter(v => v === a).length -
            languageArray.filter(v => v === b).length,
        )
        .pop();
      if (tweetLang !== "" && tweetLang != undefined) {
        lang = tweetLang;
      } else {
        lang = "en";
      }
      console.log(lang);
      textTweet = tweets;
      return (textTweet = tweets);
    })
    .catch(err => {
       res.status(404).json(err);
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
          accept: "application/json",
        },
      };
      return paramsWatson;
    })
    .catch(err => {
      console.log(err)
    })

    .then(stageThree => {
      personalityInsights.profile(stageThree, (error, response) => {
        if (error) {
          res.json({
            error: error,
          });
          return;
        } else {
          let randomNumber = Math.floor(Math.random() * 10) + 1;
          var recommendedMovies = [];
          let moviesResult =
            response.consumption_preferences[4].consumption_preferences;
          let finalMovies = [];

          //Aqui tendriamos que hacer el calculo para sacar las peliculas que pueden gustarle a la persona debemos ver si podemos hacer la red Neuronal
          let likedGenres = moviesResult.filter(movie => movie.score === 1);

          for (let i = 0; i < likedGenres.length; i++) {
            switch (likedGenres[i].consumption_preference_id) {
              case "consumption_preferences_movie_romance":
                recommendedMovies.push({
                  name: "romance",
                  id: 10749,
                });
                break;

              case "consumption_preferences_movie_adventure":
                recommendedMovies.push({
                  name: "adventure",
                  id: 12,
                });
                break;
              case "consumption_preferences_movie_horror":
                recommendedMovies.push({
                  name: "horror",
                  id: 27,
                });
                break;
              case "consumption_preferences_movie_musical":
                recommendedMovies.push({
                  name: "musical",
                  id: 10402,
                });
                break;
              case "consumption_preferences_movie_historical":
                recommendedMovies.push({
                  name: "historical",
                  id: 36,
                });
                break;
              case "consumption_preferences_movie_science_fiction":
                recommendedMovies.push({
                  name: "scienceFiction",
                  id: 878,
                });
                break;
              case "consumption_preferences_movie_war":
                recommendedMovies.push({
                  name: "war",
                  id: 10752,
                });
                break;
              case "consumption_preferences_movie_drama":
                recommendedMovies.push({
                  name: "drama",
                  id: 18,
                });
                break;
              case "consumption_preferences_movie_action":
                recommendedMovies.push({
                  name: "action",
                  id: 28,
                });
                break;
              case "consumption_preferences_movie_documentary":
                recommendedMovies.push({
                  name: "documentary",
                  id: 99,
                });
                break;

              default:
                break;
            }
          }

          //Ultima llamada al api de peliculas
          const promises = recommendedMovies.map(
            ({ id }) =>
              new Promise((resolve, reject) => {
                axios
                  .get(
                    `https://api.themoviedb.org/3/discover/movie?api_key=3c5bc5cac4d9c2e29d68ab73c21b1cfb&language=es-LA&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randomNumber}&with_genres=${id}`,
                  )
                  .then(movies => {
                    resolve(movies.data.results);
                  })
                  .catch(error => reject("error"));
              }),
          );

          const result = Promise.all(promises);
          result
            .then(promises_results => {
              res.status(200).json(promises_results);
            })
            .catch(err => {
              console.log(err);
            });
        }
      });
    });
});

// @route   POST /api/tweets/:username
//@Params   username: Twitter username
// @desc    Make a request to the twitter api
// @access  Private
router.get("/tweets/:username", (req, res) => {
  // https://dev.twitter.com/rest/reference/get/statuses/user_timeline

  const username = req.params.username;

  twitterObj.get(
    "statuses/user_timeline",
    {
      screen_name: username,
      count: 20,
    },
    function(error, tweets, response) {
      if (!error) {
        res.status(200).json({
          title: "Express",
          tweets: tweets,
        });
      } else {
        res.status(500).json({
          error: error,
        });
      }
    },
  );
});

router.get("/movies/:genreId/page/:page", (req, res) => {
  const genreId = req.params.genreId;

  tmdb.genre.list((err, response) => console.log(response));
  tmdb.genre.movies(genreId, 4, (err, response) => {
    if (!err) {
      res.json(response);
    } else {
      res.json(err);
    }
  });
});

router.get("/version", (req, res, next) => {
  res.json({
    TwitterVersion: twitterObj.VERSION,
    IbmVersion: personalityInsights.serviceVersion,
  });
});

module.exports = router;
