//Profile model
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Section includes all other schemas
const movieSchema = new Schema({
  title: {
    type: String,
  },
  overview: {
    type: String,
  },
  background: {
    type: String,
  },
  release: {
    type: String,
  },
});

const profileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    location: {
      type: String,
    },
    skills: {
      type: [String],
    },
    bio: {
      type: String,
    },

    favoriteMovies: {
      type: [movieSchema],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

const Profile = mongoose.model("Profile", profileSchema);
module.exports = Profile;
