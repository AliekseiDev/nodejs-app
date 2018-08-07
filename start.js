const mongoose = require('mongoose');

// make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major <= 7 && minor <= 5) {
  console.log('Node.js version conflict');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
  console.error(`mongoError => ${err.message}`);
});
mongoose.connection.once('open', (err) => {
  console.log(`Mongoose connected. ☻ ♥ ☺`);
});

// connect all models
require('./models/Store');
require('./models/User');
require('./models/Review');
require('./models/Complaint');

// start app!
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
