const Joi = require('joi');
const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	winnerVideo: String,
	liveDrawVideo: String,
	img: String,
	ticket: String,
	prize: String,
	dateWon: {
		type: Date,
		index: true
	},
}, {
	timestamps: true
});

const Winner = mongoose.model('winners', winnerSchema);

function validateWinners(game) {
	const schema = {
		name: Joi.string().min(2).max(255).required(),
		img: Joi.string().required(),
		prize: Joi.string().required(),
		ticket: Joi.string().required(),
		dateWon: Joi.date().required(),
	};
	return Joi.validate(game, schema);
}


exports.Winner = Winner;
exports.validateWinners = validateWinners;