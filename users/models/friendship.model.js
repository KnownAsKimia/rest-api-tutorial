const mongoose = require("../../common/services/mongoose.service").mongoose;
const Schema = mongoose.Schema;

const friendshipSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "Users" },
  friends: [{ type: Schema.Types.ObjectId, ref: "Users" }],
});

friendshipSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

friendshipSchema.set("toJSON", {
  virtuals: true,
});

const Friendship = mongoose.model("Friendships", friendshipSchema);

exports.getFriends = (userId) => {
  return Friendship.findOne({ user: userId }).populate("friends");
};

exports.createFriendship = (userId) => {
  const friendship = new Friendship({ user: userId, friends: [] });
  return friendship.save();
}

exports.addFriend = (userId, friendId) => {
  return Friendship.findOne({ user: userId }).then((friendship) => {
    friendship.friends.push(friendId);
    return friendship.save();
  });
};

exports.removeFriend = (userId, friendId) => {
  return Friendship.findOne({ user: userId }).then((friendship) => {
    const friendIndex = friendship.friends.indexOf(friendId);
    if (friendIndex > -1) {
      friendship.friends.splice(friendIndex, 1);
    }
    return friendship.save();
  });
};
