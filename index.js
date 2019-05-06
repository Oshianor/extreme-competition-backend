const config = require('config');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const auth = require('./routes/auth.routes');
const user = require('./routes/user.routes');
const game = require('./routes/game.routes');
const play = require('./routes/play.routes');
const express = require('express');
const app = express();
let cors = require('cors')
const error = require("./middlewares/error.middlewares");
require('winston-mongodb');
require('./services/cron/update.game.cron');
var logger = require('./logger');





process.on("uncaughtException", (ex) => {
  logger.errorLog.info(ex.message);
  // winston.error(ex.message, ex);
  process.exit(1);
});

process.on("unhandledRejection", (ex) => {
  logger.accessLog.info(ex.message);
  console.log(ex.message);
});



// json web token code
if (!config.get('jwtPrivateKey')) {
  console.error('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1);
}




// connecting to the database
mongoose.connect(config.get('databaseUrl'), { useNewUrlParser: true, useCreateIndex: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));




// exposing certain headers
app.use(express.json());

const corsOptions = {
  exposedHeaders: ['x-auth-token'],
};






// routes folders
app.use(cors(corsOptions));
app.use(express.static('public'));


app.use('/api/user', user);
app.use('/api/auth', auth);
app.use('/api/game', game);
app.use('/api/play', play);
app.use(error);



const port = process.env.PORT || config.get('port');
app.listen(port, () => console.log(`Listening on port ${port}...`));
