//Profile model
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
      type: [String],
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
