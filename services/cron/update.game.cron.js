const cron = require('node-cron');
const { Game } = require('../../models/game.models');

cron.schedule('20 * * * *', async () => {
	let availableGmaes = await Game.find({ status: true });
	console.log('availableGmaes.length', availableGmaes.length);
	
	if(availableGmaes.length > 0) {
		let currentDate = new Date();
		availableGmaes.forEach(async game => {
			console.log("check------lll", game.timer <= currentDate);
			
			if(game.timer <= currentDate) {
				await Game.findByIdAndUpdate(game._id, { status: false });
			}
		})
	}
})