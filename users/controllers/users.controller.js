const UserModel = require("../models/users.model");
const FriendshipModel = require("../models/friendship.model");
const crypto = require("crypto");

exports.insert = (req, res) => {
  let salt = crypto.randomBytes(16).toString("base64");
  let hash = crypto
    .createHmac("sha512", salt)
    .update(req.body.password)
    .digest("base64");
  req.body.password = salt + "$" + hash;
  req.body.permissionLevel = 1;
  UserModel.createUser(req.body).then((result) => {
    res.status(201).send({ id: result._id });
  });
};

exports.list = (req, res) => {
  let limit =
    req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
  let page = 0;
  if (req.query) {
    if (req.query.page) {
      req.query.page = parseInt(req.query.page);
      page = Number.isInteger(req.query.page) ? req.query.page : 0;
    }
  }
  UserModel.list(limit, page).then((result) => {
    res.status(200).send(result);
  });
};

exports.getById = (req, res) => {
  UserModel.findById(req.params.userId).then((result) => {
    if (req.query.includeFriends === "true") {
      FriendshipModel.getFriends(req.params.userId).then((friendship) => {
        result.friends = friendship.friends;
        res.status(200).send(result);
      });
    } else {
      res.status(200).send(result);
    }
  });
};

exports.patchById = (req, res) => {
  if (req.body.password) {
    let salt = crypto.randomBytes(16).toString("base64");
    let hash = crypto
      .createHmac("sha512", salt)
      .update(req.body.password)
      .digest("base64");
    req.body.password = salt + "$" + hash;
  }

  UserModel.patchUser(req.params.userId, req.body).then((result) => {
    res.status(204).send({});
  });
};

exports.removeById = (req, res) => {
  UserModel.removeById(req.params.userId).then((result) => {
    res.status(204).send({});
  });
};

exports.removeFriend = (req, res) => {
  FriendshipModel.removeFriend(req.params.userId, req.params.friendId).then(
    (result) => {
      res.status(200).send(result.friends);
    }
  );
};

exports.addFriend = (req, res) => {
  const userId = req.params.userId;
  const friendId = req.body.friendId;

  FriendshipModel.getFriends(userId)
    .then((friendship) => {
      if (!friendship) {
        FriendshipModel.createFriendship(userId)
          .then((result) => {
            res.status(200).send(result.friends);
          })
          .catch((error) => {
            res.status(500).send({ error: "Failed to add friend." });
          });
      } else {
        FriendshipModel.addFriend(userId, friendId)
          .then(() => {
            res.status(200).send({ message: "Friend added successfully." });
          })
          .catch((error) => {
            res.status(500).send({ error: "Failed to add friend." });
          });
      }
    })
    .catch((error) => {
      res.status(500).send({ error: "Failed to get user friends." });
    });
};
