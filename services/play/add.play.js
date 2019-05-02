const { Play } = require('../../models/play.models');


createGamePlay = async (userId, gameId, ticket, name, amt) => {
	let newPlay = new Play({
		userId, gameId, ticket, amt, name
	})
	let play = await newPlay.save();
	if (play) {
		return play;
	}
	return false;
};

updateGamePlay = async (playId, amt) => {
	let play = await Play.findByIdAndUpdate(playId, { amt });
	if (play) {
		return play;
	}
	return false;

}

module.exports.createGamePlay = createGamePlay;
module.exports.updateGamePlay = updateGamePlay;
