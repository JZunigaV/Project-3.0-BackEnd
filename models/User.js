const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: String,
    email: String,
    avatarUrl: {
      type: String,
      default:
        "https://eadb.org/wp-content/uploads/2015/08/profile-placeholder.jpg",
    },
    password: String,
    twitterUsername:{

      type:String,
      default:""

    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

const User = mongoose.model("User", userSchema);
module.exports = User;
