const { Game, validateCreateGame } = require('../models/game.models');
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const moment = require('moment')
const auth = require('../middlewares/auth.middlewares');
const admin = require('../middlewares/admin.middlewares');
const { createGame, createGameWinners, editGame, createTestimonal } = require('../services/game/add.game');
const {
  getCurrentGame,
  getGame,
  getAllGames,
  getAllTestimonie,
  getEightGame,
  getWinnersByMonth
} = require("../services/game/read.game");
const { Testimonal, validateTestimonial } = require("../models/testimonials.model")
const multer  = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/game/')
  },
  // filename: function (req, file, cb) {
  //   cb(null, file.originalname)
  // }
})
const upload = multer({ storage: storage })




// create new game
router.post('/', auth, admin,  upload.array('img', 3), async (req, res) => {
	let response = { error: true, msg: '', content: [] };

	console.log('req.files', req.files);
	let img = [];
	req.files.forEach(file => {
		img.push(file.filename);
	})
	let name = req.body.name;
	let amt = req.body.amt;
	let condition = req.body.condition;
	let timer = req.body.timer;
	let description = req.body.description;
	let slot = req.body.slot;


	const { error } = validateCreateGame({
		name, amt, timer, slot
	});

  if (error) {
  	response.error = true;
  	response.msg = error.details[0].message;
  	return res.status(200).send(response);
	}
	

	let game = await createGame(name, amt, condition, timer, img, description, slot);
  response.error = true;
	response.msg = "Something went wrong And Game couldn't be created!";
	if (!game) return res.status(200).send(response);

	response.error = false;
	response.msg = "";
	response.content = game;
	res.send(response);
});




// edit new game
router.post('/edit', auth, admin, async (req, res) => {
	let response = { error: true, msg: '', content: [] };

	let gameId = req.body.gameId;
	let name = req.body.name;
	let amt = req.body.amt;
	let condition = req.body.condition;
	let timer = req.body.timer;
	let description = req.body.description;
	let slot = req.body.slot;
	let status = req.body.status;


	const { error } = validateCreateGame({
		name, amt, timer, slot
	});

  if (error) {
  	response.error = true;
  	response.msg = error.details[0].message;
  	return res.status(200).send(response);
	}
	

	let game = await editGame(gameId, name, amt, condition, timer, description, slot, status);
  response.error = true;
	response.msg = "Something went wrong And Game couldn't be created!";
	if (!game) return res.status(200).send(response);

	response.error = false;
	response.msg = "";
	response.content = game;
	res.send(response);
});





router.post('/winner/add', auth, admin, upload.array('img', 1), async (req, res) => {
	let response = { error: true, msg: '', content: [] };

	console.log('req.files', req.files[0]);

	let name = req.body.name;
	let dateWon = req.body.dateWon;
	let prize = req.body.prize;
	let ticket = req.body.ticket;
	let img = req.files[0].filename;
	let winnerVideo = req.body.winnerVideo;
	let liveDrawVideo = req.body.liveDrawVideo;


	let winner = await createGameWinners(name, prize, ticket, dateWon, winnerVideo, liveDrawVideo, img);
	
	response.error = false;
	response.msg = "";
	response.content = [];
	res.send(response);
});



router.get('/winner/getByMonth/:number', async (req, res) => {
	let response = { error: true, msg: '', content: [] };

	let number = req.params.number ? req.params.number : 0;

	let startOfMonth = moment()
			.startOf("month");;
	let endOfMonth = moment()
      .endOf("month");;

	if (number > 0 ) {
		startOfMonth = moment()
      .add("month", number)
			.startOf("month");
		endOfMonth = moment()
      .add("month", number)
      .endOf("month");
	} 
	if(number < 0) {
		startOfMonth = moment()
      .subtract("month", Math.abs(number))
			.startOf("month");
		endOfMonth = moment()
      .subtract("month", Math.abs(number))
      .endOf("month");
	}

	console.log('startOfMonth', startOfMonth, 'endOfMonth', endOfMonth);
	
	let winner = await getWinnersByMonth(startOfMonth, endOfMonth);
	
	response.error = false;
	response.msg = "";
	response.content = {date: startOfMonth.format('MMM YY'), winner};
	res.send(response);
});




router.post('/testimonial/add', auth, admin, upload.array('img', 1), async (req, res) => {
	let response = { error: true, msg: '', content: [] };

	let name = req.body.name;
	let img = req.files[0].filename;
	let prize = req.body.prize;
	let msg = req.body.msg;

	const { error } = validateTestimonial({
		name, img, prize, msg
	});

  if (error) {
  	response.error = true;
  	response.msg = error.details[0].message;
  	return res.status(200).send(response);
	}

	let game = await createTestimonal(name, img, prize, msg)
	
	response.error = false;
	response.msg = "";
	response.content = game;
	res.send(response);
});





router.get('/testimonial/read', async (req, res) => {
	let response = { error: true, msg: '', content: [] };

	let game = await getAllTestimonie();
	response.error = false;
	response.msg = "";
	response.content = game;
	res.send(response);
});




router.get('/testimonial/delete/:testId', async (req, res) => {
	let response = { error: true, msg: '', content: [] };

	let testId = req.params.testId;
	
	await Testimonial.findByIdAndDelete(testId);

	let game = await getAllTestimonie();
	response.error = false;
	response.msg = "";
	response.content = game;
	res.send(response);
});




router.get('/current', async(req, res) => {
	let response = { error: true, msg: '', content: [] };

	let game = await getCurrentGame();
	response.error = false;
	response.msg = "";
	let test = await Testimonal.find({ }).sort({ createdAt: -1 }).limit(3);
	let eight = await getEightGame();
	response.content =  { game, testimonial: test, eight };
	res.send(response);
});




router.get('/single/:gameId', async (req, res) => {
	let response = { error: true, msg: '', content: [] };
	let gameId = req.params.gameId;
	console.log("gameId", gameId);
	

	let game = await getGame(gameId);
	
	response.error = false;
	response.msg = "";
	response.content = game;
	res.send(response);
});




router.get('/all', async(req, res) => {
	let response = { error: true, msg: '', content: [] };

	let game = await getAllGames();
	response.error = false;
	response.msg = "";
	response.content = game;
	res.send(response);
});




router.get('/remove/:gameId', auth, admin, async (req, res) => {
	let response = { error: true, msg: '', content: [] };

	let gameId = req.params.gameId;
	console.log('gameId', gameId);
	

	await Game.findByIdAndDelete(gameId);
	let game = await getAllGames();
	response.error = false;
	response.msg = "";
	response.content = game;
	res.send(response);
});


module.exports = router; 
