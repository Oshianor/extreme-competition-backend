const Joi = require('joi');
const bcrypt = require('bcrypt');
const { User, validateRegisterUser } = require('../models/user.models');
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middlewares');
var nodemailer = require("nodemailer");



// register
router.get('/me', auth, async (req, res) => {
  let response = { error: true, msg: '', content: [] }

  let user = await User.findById(req.user._id).select('-password');
  
  response.error = false;
  response.msg = '';
  response.content = user
  res.send(response);
});






// register
router.post('/', async (req, res) => {
  let userRes = { error: true, msg: '', content: [] }
  
  const { error } = validateRegisterUser(req.body); 
	
	// failed
  if (error) { userRes.error = true; userRes.msg = error.details[0].message; return res.status(200).send(userRes); } 

	let email = req.body.email;
	let password = req.body.password;
  let confirmPassword = req.body.confirmPassword;
  let fullName = req.body.fullName;
  let phone = req.body.phone;
  
  // check if password and confirm passsword match
  if(password !== confirmPassword) {
    userRes.error = true; 
    userRes.msg = "Password and Confirm Password wasn't a match"
    return res.status(200).send(userRes);
  }

  let userAcct = await User.findOne({ email })
  
  userRes.error = true;
  userRes.msg = 'Account already exist. Please login';
  if (userAcct) return res.status(200).send(userRes);

  let hashPassword = await bcrypt.hash(password, 10)
  let newUser = new User({
    email: email.toLowerCase(),
    fullName,
    phone,
    password: hashPassword
  });

  let user = await newUser.save();
  
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
    subject: "Welcome Email", // Subject line
    html: `
      <img src="https://www.extremecompetitions.com/static/extremecompetitions.jpeg" />
      <br /><br />
      <h4>Hello, ${fullName}</h4>
      <br />
      <p>Congratulations and welcome to Extremecompetitions. 
      We are Africa’s largest interactive prize competition platform.</p>
      <br />
      <p>If you have any questions, please visit our FAQ page or contact us. 
      Our Customer support team is available 24/7.</p>
      <br />
      <p>Best Regards,</p>
      <br />
      <p>Extreme Competitions Team!</p>
      <br /><br />
      <p>2019 TCAI</p>
      ` // plain text body
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) console.log(err);
    else console.log(info);
  });

  // generate token for the user
  const token = user.generateAuthToken();

  userRes.error = false;
  userRes.msg = '';
  userRes.content = await User.findById(user._id).select('-password');
  res.header('x-auth-token', token).send(userRes);
});


module.exports = router; 
