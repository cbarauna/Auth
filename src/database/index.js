const mongoose = require("mongoose");

mongoose.connect("", { useMongoClient: true });

mongoose.Promise = global.Promise;

module.exports = mongoose;
