const { Game } = require("../../models/game.models");
const { Winner } = require('../../models/winnner.model');
const moment = require('moment');
const { Testimonal } = require("../../models/testimonials.model")

// create a new game
createGame = async (name, amt, condition, timer, img, description, slot) => {
	let newGame = new Game({
		name, 
		timer: moment().add(timer, condition),
		amt,
		img,
		slot,
		description
	});
	let game = await newGame.save();
	if (game) {
		return game;
	}
	return false;
}


// create a new testimonial
createTestimonal = async (name, img, prize, msg) => {
	let newTestimonie = new Testimonal({
		name,
		prize,
		msg,
		img
	});

	let test = await newTestimonie.save();

	if (test) {
		return test;
	}
	return false;
}


editGame = async (gameId, name, amt, condition, timer, description, slot, status) => {
	let game = await Game.findByIdAndUpdate(gameId, {
    name,
    timer: moment().add(timer, condition),
    amt,
    slot,
    description,
    status
  });
	if (game) {
		return game;
	}
	return false;
}



createGameWinners = async (name, prize, ticket, dateWon, winnerVideo, liveDrawVideo, img) => {
  // let game = await Game.findByIdAndUpdate(gameId, { winners: obj });
  let newWinner = new Winner({
    name,
    prize,
    ticket,
    dateWon,
    winnerVideo,
    liveDrawVideo,
    img
	});
	
	let winner = await newWinner.save();
  if (winner) {
    return winner;
  }
  return false;
};


module.exports.editGame = editGame;
module.exports.createGame = createGame;
module.exports.createTestimonal = createTestimonal;
module.exports.createGameWinners = createGameWinners;
