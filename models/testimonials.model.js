const Joi = require('joi');
const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	msg: String,
	img: String,
	prize: String
}, {
	timestamps: true
});

const Testimonal = mongoose.model('testimonials', testimonialSchema);

function validateTestimonial(game) {
	const schema = {
		name: Joi.string().min(2).max(255).required(),
		img: Joi.string().required(),
		prize: Joi.string().required(),
		msg: Joi.string().required()
	};
	return Joi.validate(game, schema);
}


exports.Testimonal = Testimonal;
exports.validateTestimonial = validateTestimonial;