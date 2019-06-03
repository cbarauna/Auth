const mongoose = require("mongoose");
try {
  mongoose.connect(
    "mongodb+srv://root:root@cluster0-fze0y.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  );
} catch (err) {
  console.log(err);
}

mongoose.Promise = global.Promise;

module.exports = mongoose;
