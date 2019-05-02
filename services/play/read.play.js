const { Play } = require('../../models/play.models');


HandleCheckIfLuckyNumberIsUniqueForAGame = async (gameId, ticket) => {
	let play = await Play.findOne({ gameId, ticket });

	if (play) {
		return true	
	}
	return false;
}

getAllAvailableTicketForGame = async (gameId) => {
	let play = await Play.find({ gameId });

	let tickets = []
	play.forEach(ply => {
		tickets.push(ply.ticket);
	})
	return tickets;
} 


module.exports.HandleCheckIfLuckyNumberIsUniqueForAGame = HandleCheckIfLuckyNumberIsUniqueForAGame;
module.exports.getAllAvailableTicketForGame = getAllAvailableTicketForGame;
