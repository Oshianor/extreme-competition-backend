const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    index: true,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  phone: {
    type: Number,
    required: true
  },
  isAdmin: {
    type: Number,
    default: 0
  }, 
},
{ timestamps: true },
{
  collation: {
    locale: 'en_US',
    strength: 1
  }
}
);

userSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin, email: this.email, name: this.fullName }, config.get('jwtPrivateKey'));
  return token;
}

const User = mongoose.model('User', userSchema);

function validateRegisterUser(user) {
  const schema = {
    fullName: Joi.string().min(3).max(255).required(),
    email: Joi.string().min(5).max(255).required().email(),
    phone: Joi.number().required(),
    password: Joi.string().min(5).max(255).required(),
    confirmPassword: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(user, schema);
}

function validateLoginUser(user) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  };

  return Joi.validate(user, schema);
}

exports.User = User; 
exports.validateRegisterUser = validateRegisterUser;
exports.validateLoginUser = validateLoginUser;