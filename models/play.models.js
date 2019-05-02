const Joi = require('joi');
const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const playSchema = new mongoose.Schema({
	userId: {
		type: ObjectId,
		required: true,
		index: true
	},
	name: String,
	gameId: {
		type: ObjectId,
		required: true,
		index: true
	},
	ticket: {
		type: Number,
		required: true,
		index: true
	},
	amt: Number,
}, { timestamps: true } );

const Play = mongoose.model('Play', playSchema);

function validateCreatePlay(play) {
	const schema = {
		gameId: Joi.string().min(5).max(50).required(),
		userId: Joi.string().min(5).max(50).required(),
		ticket: Joi.array().required(),
		amt: Joi.number().required()
	};
	return Joi.validate(play, schema);
}


exports.Play = Play;
exports.validateCreatePlay = validateCreatePlay;