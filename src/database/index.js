const mongoose = require("mongoose");

mongoose.connect(
  "mongodb://bossa-box:bossabox2018@ds031271.mlab.com:31271/bossa-bom-tools",
  { useMongoClient: true }
);

mongoose.Promise = global.Promise;

module.exports = mongoose;
