const { Play, validateCreatePlay } = require('../models/play.models');
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middlewares');
const { createGamePlay, updateGamePlay } = require('../services/play/add.play');
const {
	HandleCheckIfLuckyNumberIsUniqueForAGame,
	getAllAvailableTicketForGame
} = require('../services/play/read.play');
const { checkIfGameIsActive } = require('../services/game/read.game')
var nodemailer = require("nodemailer");


// create new play
router.post('/', auth, async(req, res) => {
	let response = { error: true, msg: '', content: [] };

	let userId = req.user._id;
	let name = req.user.name;
	let gameId = req.body.gameId;
	let ticket = req.body.ticket;
	let amt = req.body.amt;
	let email = req.user.email;


	console.log("ticket", ticket);

	// check if game is active for play
	const gameActive = await checkIfGameIsActive(gameId);
	if (!gameActive) {
		response.error = true;
		response.msg = "Registeration for this Game isn't active anymore.";
		response.content = [];
		return res.send(response);
	}
	
			const { error } = validateCreatePlay({
        gameId,
        ticket,
        amt,
        userId
      });

      if (error) {
        response.error = true;
        response.msg = error.details[0].message;
        return res.status(200).send(response);
			}
			

		// var transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
        
    //   }
    // });

		// const mailOptions = {
    //   from: "abundanceoshianor@gmail.com", // sender address
    //   to: email, // list of receivers
    //   subject: "Ticket Receipt", // Subject line
    //   html: `<h4>Payment for #${ticket} was successfully.</h4>` // plain text body
    // };

		// transporter.sendMail(mailOptions, function(err, info) {
    //   if (err) console.log(err);
    //   else console.log(info);
    // });

		ticket.forEach(async tick => {
      console.log(tick);
      let play = await HandleCheckIfLuckyNumberIsUniqueForAGame(
        gameId,
        tick
      );

      if (play) {
        response.error = true;
        response.msg = "This ticket has already been taken.";
        response.content = [];
        return res.send(response);
      }

      let game = await createGamePlay(userId, gameId, tick, name, amt);
      response.error = true;
      response.msg =
				"Something went wrong and game play couldn't be created!";
			response.content = await getAllAvailableTicketForGame(gameId);
			if (!game) return res.status(200).send(response);
			
			response.error = false;
      response.msg = "";
      response.content = await getAllAvailableTicketForGame(gameId);
      return res.send(response);
		});



		
		

});





router.get('/tickets/:gameId', async(req, res) => {
	let response = { error: true, msg: '', content: [] };

	let gameId = req.params.gameId;

	response.error = false;
	response.msg = "";
	response.content = await getAllAvailableTicketForGame(gameId);
	res.send(response);
});





router.post('/confirmPayment', auth, async(req, res) => {
	let response = { error: true, msg: '', content: [] };

	let gameId = req.body.gameId;
	let luckyNumber = req.body.luckyNumber;
	let play = await HandleCheckIfLuckyNumberIsUniqueForAGame(gameId, luckyNumber);

	if(play) {
		response.error = true;
		response.msg = "This number already exist.";
		response.content = [];
		res.send(response);
	}

	response.error = false;
	response.msg = "";
	response.content = [];
	res.send(response);
});



module.exports = router; 
