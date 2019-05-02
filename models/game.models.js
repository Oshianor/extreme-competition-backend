const Joi = require('joi');
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 255
	},
	img: Array,
	amt: {
		type: Number,
		required: true
	},
	status: {
		type: Boolean,
		default: true 
	},
	slot: {
		type: Number,
	},
	description: String,
	timer: {
		type: Date,
		min: new Date()
	}
}, { timestamps: true } );

const Game = mongoose.model('Game', gameSchema);

function validateCreateGame(game) {
	const schema = {
		name: Joi.string().min(2).max(255).required(),
		timer: Joi.number().min(1).max(255).required(),
		amt: Joi.number().min(2).required(),
		slot: Joi.number().min(2).required()
	};
	return Joi.validate(game, schema);
}


exports.Game = Game;
exports.validateCreateGame = validateCreateGame;