const Joi = require('joi');
const bcrypt = require('bcrypt');
const { User, validateLoginUser } = require('../models/user.models');
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middlewares');
const moment = require("moment")
const nodemailer = require("nodemailer");



// login
router.post('/', async (req, res) => {
  let userRes = { error: true, msg: '', content: [] }
  
  const { error } = validateLoginUser(req.body); 
	
	// failed
  if (error) { userRes.error = true; userRes.msg = error.details[0].message; return res.status(200).send(userRes); } 

	let email = req.body.email;
	let password = req.body.password;

  // let user = await User.findOne({ email: req.body.email.toLowerCase() });
  // let user = await User.findOne({ email: { $regex: new RegExp("^" +  req.body.email , "i") } })
  let user = await User.findOne({ email })
  
  userRes.error = true;
  userRes.msg = 'Invalid email or password.';
  if (!user) return res.status(200).send(userRes);


  const validPassword = await bcrypt.compare(password, user.password);

  userRes.msg = 'Invalid email or password.';
  userRes.error = true;  
  if (!validPassword) return res.status(200).send(userRes);

  // generate token for the user
  const token = user.generateAuthToken();

  userRes.error = false;
  userRes.msg = '';
  userRes.content = await User.findById(user._id).select('-password');
  res.header('x-auth-token', token).send(userRes);
});






router.post("/reset", async (req, res) => {
  let userRes = { error: true, msg: "", content: [] };

  let email = req.body.email;

  let user = await User.findOne({
    email: { $regex: new RegExp("^" + email, "i") }
  });

  userRes.error = true;
  userRes.msg =
    "Password has been resetted. Check your email for link to change password";
  if (!user) return res.status(404).send(userRes);

  let token = generateToken();

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "info.extremecompetitions@gmail.com",
      pass: "Extreme-competitions123"
    }
  });

  const mailOptions = {
    from: "info.extremecompetitions@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Password Reset Link",
    html:
      '<body style="text-align: center; margin: 2% 15%;"><img src="https://www.extremecompetitions.com/static/extremecompetitions.jpeg" ><h2 style="margin-bottom: 10px;text-transform: uppercase;">Password Reset</h2><h4 style="text-align: left">Hi,' +
      user.fullName +
      " </h4><p>We've received a request to reset your password. If you didn't make the request, just ignore this email. Otherwise, you can reset your password using this link. This link will expire in 2 hours.</p><a href=\"https://extremecompetitions.com/reset/" +
      token +
      '" style="font-size: 15px; text-decoration: none; font-weight: 500; background-color: #3cb7e6;color: black; padding: 15px; border-radius: 0px;box-shadow: 0px 2px 3px -1px"> RESET PASSWORD</a> <p>Thanks,</p><p>The Extreme Competition Team,</p><br /><br /><p>2019 TCAI</p></body>'
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) console.log(err);
    else console.log(info);
  });

  await User.findOneAndUpdate(
    { email: { $regex: new RegExp("^" + email, "i") } },
    { remember_token: { token, expired: moment().add(2, "hours") } }
  );

  userRes.error = false;
  userRes.msg =
    "Password as been resetted. Check your email for link to change password";
  userRes.content = [];
  return res.send(userRes);
});




router.get("/check/resettoken/:token", async (req, res) => {
  console.log("yes");
  
  let userRes = { error: true, msg: "", content: [] };

  let token = req.params.token;
  let currentDate = new Date().valueOf();

  let user = await User.findOne({
    "remember_token.token": token,
    "remember_token.expired": { $gt: currentDate }
  }).select({
    _id: 1
  });
  console.log("userus", token, "eruser", user, "currentDate", currentDate);

  userRes.error = true;
  userRes.msg = "Token alreadly expired. Pleasee reset password again.";
  if (!user) return res.status(404).send(userRes);

  userRes.error = false;
  userRes.msg = "Password as been resetted. Check your email for new password";
  userRes.content = user;
  return res.send(userRes);
});



router.post("/user/reset/password", async (req, res) => {
  let userRes = { error: true, msg: "", content: [] };

  let userObjId = req.body.userObjId;
  let password = req.body.password;

  // let user = await User.findById(userObjId);

  // now if the current provided is a match then
  let newPass = await bcrypt.hash(password, 10);
  // newPass = newPass.replace("$2b$", "$2y$");

  // update the user password
  await User.findByIdAndUpdate(userObjId, {
    password: newPass,
    remember_token: null,
  });

  userRes.error = false;
  userRes.msg = "";
  res.send(userRes);
});





function generateToken() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 40; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


function generatePassword() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 7; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(req, schema);
}

module.exports = router; 
