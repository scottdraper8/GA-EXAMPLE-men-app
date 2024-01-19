/* Require modules
--------------------------------------------------------------- */
require('dotenv').config()
const path = require('path');
const express = require('express');
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");
const methodOverride = require('method-override');


/* Require the db connection, models, and seed data
--------------------------------------------------------------- */
const db = require('./models');


/* Require the routes in the controllers folder
--------------------------------------------------------------- */
const petsCtrl = require('./controllers/pets')
const applicationsCtrl = require('./controllers/applications')


/* Create the Express app
--------------------------------------------------------------- */
const app = express();


/* Configure the app to refresh the browser when nodemon restarts
--------------------------------------------------------------- */
const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
    // wait for nodemon to fully restart before refreshing the page
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});


/* Configure the app (app.set)
--------------------------------------------------------------- */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


/* Middleware (app.use)
--------------------------------------------------------------- */
app.use(express.static('public'));
app.use(connectLiveReload());
// Body parser: used for POST/PUT/PATCH routes:
// this will take incoming strings from the body that are URL encoded and parse them
// into an object that can be accessed in the request parameter as a property called body (req.body).
app.use(express.urlencoded({ extended: true }));
// Allows us to interpret POST requests from the browser as another request type: DELETE, PUT, etc.
app.use(methodOverride('_method'));


/* Mount routes
--------------------------------------------------------------- */
// Home page
app.get('/', async function (req, res) {
    const pets = await db.Pet.find({ isFeatured: true })
    res.render('home', { pets: pets })
});

// About page
app.get('/about', function (req, res) {
    res.render('about')
});

// When a GET request is sent to `/seed`, the pets collection is seeded
app.get('/seed', async (req, res) => {
    // Remove any existing pets
    const formerPets = await db.Pet.deleteMany({})
    console.log(`Removed ${formerPets.deletedCount} pets`)
    // Seed the pets collection with the starter data
    const newPets = await db.Pet.insertMany(db.seedPets)
    console.log(`Added ${newPets.length} pets to be adopted`)
    // Send a JSON response to the user of all the new pet documents
    res.json(newPets)
})

// This tells our app to look at the `controllers/pets.js` file 
// to handle all routes that begin with `localhost:3000/pets`
app.use('/pets', petsCtrl)

// This tells our app to look at the `controllers/applications.js` file
// to handle all routes that begin with `localhost:3000/applications`
app.use('/applications', applicationsCtrl)

// The "catch-all" route: Runs for any other URL that doesn't match the above routes
app.get('*', function (req, res) {
    res.render('404')
});


/* Tell the app to listen on the specified port
--------------------------------------------------------------- */
app.listen(process.env.PORT, function () {
    console.log('Express is listening to port', process.env.PORT);
});