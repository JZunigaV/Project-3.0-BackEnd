//Movie Model
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Section includes all other schemas
const movieSchema = new Schema({
  title: {
    type: String,
    default: "",
  },
  overview: {
    type: String,
    default: "",
  },
  background: {
    type: String,
    default: "",
  },
  release: {
    type: String,
    default: "",
  },
  posterPath: {
    type: String,
    default: "",
  },
});

const Profile = mongoose.model("Movie", movieSchema);
module.exports = Movie;
