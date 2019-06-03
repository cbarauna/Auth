const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../../modules/mailer");

const authConfig = require("../../config/auth.json");

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign({ id: user.id }, authConfig.secret, {
    expiresIn: 86400
  });
}

router.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "User already exists" });

    const user = await User.create(req.body);
    user.password = undefined;
    return res.send({ user });
  } catch (error) {
    return res.status(400).send({ error: "Registration failed" });
  }
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) return res.status(400).send({ error: "User not found" });
  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({ error: "Invalid password" });
  user.password = undefined;

  res.send({ user, token: generateToken(user.id) });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ error: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");
    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now
      }
    });
    mailer.sendMail(
      {
        to: email,
        from: "",
        template: "auth/forgot_password",
        context: { token }
      },
      err => {
        if (err) {
          return res.status(400).send({ error: "Cannot send password" });
        }
        return res.send();
      }
    );
    console.log(token, now);
  } catch (err) {
    res.status(400).send({ error: "Error on forgot password try again" });
  }
});

router.post("/reset_password", async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email }).select(
      "+passwordResetToken passwordResetExpires"
    );

    if (!user) return res.status(400).send({ error: "User not found" });
    if (token !== user.passwordResetToken)
      return res.send(400).send({ error: "Token Invalid" });
    const now = new Date();

    if (now > user.passwordResetExpires)
      return res.send(400).send({ erro: "Token expired" });

    user.password = password;
    await user.save();
    res.send();
  } catch (error) {
    res.status(400).send({ error: "Cannot reset Password, try again" });
  }
});
module.exports = app => app.use("/auth", router);
