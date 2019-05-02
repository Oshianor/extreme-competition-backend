const { Game } = require('../../models/game.models');
const { Play } = require('../../models/play.models');
const { Testimonal } = require("../../models/testimonials.model");
const { Winner } = require("../../models/winnner.model")
const _ = require('lodash');



getCurrentGame = async () => {
	let game = await Game.find({ status: true }).sort({ timer: 1 });
	if(game) return game;

	return false
}

getGame = async (gameId) => {
	let game = await Game.findOne({ _id: gameId });
	let play = await Play.find({ gameId: game._id }).select('createdAt').select('name').select('ticket').limit(50)
	if (game) {
		let newGame = JSON.parse(JSON.stringify(game))
		let ranger = _.range(1, game.slot + 1);
		let pag = []
		for (let i = 0; i < ranger.length; i += 50) {
			pag.push(ranger.slice(i, i + 50))
		}
		newGame.slotRange = pag;
		newGame.history = play;
		return newGame;
	} 

	return false
}

getEightGame = async () => {
	let game = await Game.find().sort({ timer: -1 }).limit(8)
	if (game) return game;

  return false;
}

getAllGames = async () => {
		// let game = await Game.find().sort({ status: -1 })
	let game = await Game.aggregate([
		{ $sort: { status: -1 } },
		{ $lookup: {
			from: 'plays',
			let: { 'gameId': "$_id" },
			pipeline: [
        { $match: { $expr: { $eq: ["$gameId", "$$gameId"] } } },
			],
			as: "play"
		}}
	])
	if(game) return game;

	return false
}


checkIfGameIsActive = async (gameId) => {
	let game = await Game.findById(gameId);
	if(game.status) return game;

	return false
}

getAllTestimonie = async () => {
	let test = await Testimonal.find();
	if (test) return test;
	return false;
}

getWinnersByMonth = async (start, end) => {
	let winner = await Winner.find({
    createdAt: {
      $gte: start,
      $lte: end
    }
	});
	return winner;
}


module.exports.getWinnersByMonth = getWinnersByMonth;
module.exports.checkIfGameIsActive = checkIfGameIsActive;
module.exports.getEightGame = getEightGame;
module.exports.getCurrentGame = getCurrentGame;
module.exports.getGame = getGame;
module.exports.getAllTestimonie = getAllTestimonie;
module.exports.getAllGames = getAllGames;
