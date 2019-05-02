const Joi = require('joi');
const bcrypt = require('bcrypt');
const { User, validateLoginUser } = require('../models/user.models');
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middlewares');


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








router.post('/changepassword', auth, async (req, res) => {
  let userRes = { error: true, msg: '', content: [] };
  let userObjId = req.user.userObjId;
  // let user = await User.findOne({ email: req.body.email.toLowerCase() });
  let user = await User.findById(userObjId);
  
  // check if current password providied matched
  let hashNewPassword = user.password.replace('$2y$', '$2b$');
  const validPassword = await bcrypt.compare(req.body.password, hashNewPassword);

  userRes.msg = 'Please provide your current password.';
  userRes.error = true;  
  if (!validPassword) return res.status(200).send(userRes);

  // now if the current provided is a match then
  let newPass = await bcrypt.hash(req.body.newPassword, 10);
  newPass = newPass.replace('$2b$', '$2y$');
  
  // update the user password
  await User.findByIdAndUpdate(userObjId, { password: newPass });

  userRes.error = false;
  userRes.msg = '';
  res.send(userRes);
});



router.post("/reset", async (req, res) => {
  let userRes = { error: true, msg: '', content: [] };

  // let user = await User.findOne({ email: { $regex: new RegExp("^" +  req.body.email , "i") } });

  // userRes.error = true;
  // userRes.msg = 'Invalid email or password.';
  // if (!user) return res.status(200).send(userRes);

  // let newPassword = generatePassword();
  // // console.log(newPassword);
  // let password = await bcrypt.hash(newPassword, 10);
  // password = password.replace('$2b$', '$2y$');

  // let sent = sendEmail(req.body.email, newPassword);
  // console.log(sent);
  let conf = {
    accessKeyId: "AKIAIVM5YAKRETCVAYLQ",
    secretAccessKey: "AugwfIKr2tzsPx7aQhVM/DK1UDU4Fs6evVyPUf85Rhez",
    region: "us-east-1"
  }

  AWS.config.update(conf);
  

  var params = {
    Destination: { /* required */
      ToAddresses: [
        'Abundanceoshianor@gmail.com'
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
          Charset: "UTF-8",
          Data: "<h4>Your password as been resetted.</h4><br/><p>A new password <strong>" + 1112222 + "</strong> has been generated for you to log in. Please ensure to change your password from your profile</p>"
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Test email'
      }
    },
    Source: 'noreply@tipestry.com',
    /* required */
    ReplyToAddresses: [
      ''
    ],
  };

  var sendPromise = new AWS.SES({
    apiVersion: '2010-12-01'
  }).sendEmail(params).promise();

  // Handle promise's fulfilled/rejected states
  sendPromise.then(
    function (data) {
      console.log(data.MessageId);
    }).catch(
    function (err) {
      console.error(err, err.stack);
    });
  
});




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
