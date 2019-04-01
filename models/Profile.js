//Profile model
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

const profileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    
    bio: {
      type: String,
    },
    social: {
      twitter: {
        type: String
      },
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
