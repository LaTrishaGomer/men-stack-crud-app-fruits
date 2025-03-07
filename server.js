//dependencies
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const Fruit = require('./models/fruit');


//initialize the express application
const app = express();

//config code
dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

//Mongoose/MongoDB event listeners
mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}`)
});

//mount middleware functions here

//body parser middleware: this function reads the request body
//and decodes it into req.body so we can access form data!
app.use(express.urlencoded({ extended: false }));

//Root path/route "HomePage"
app.get('/', async(req, res) => {
    res.render('index.ejs');
});

//Path to the page with a form we can fill out
//and submit to add a new fruit to the database
app.get('/fruits/new', (req, res) => {
    //never add a trailing slash with render
    res.render('fruits/new.ejs');
});

//Path used to receive form submissions
app.post('/fruits', async(req, res) => {
    //conditional log to handle the default behavior of html form
    //checkbox fields. we do this when we need a boolean instead of
    //a string
    if(req.body.isReadyToEat === 'on') {
        req.body.isReadyToEat = true
    } else {
        req.body.isReadyToEat = false
    }

    await Fruit.create(req.body);

    res.redirect('/fruits');
});

app.get('/fruits', async(req, res) => {
   const allFruits = await Fruit.find({});
    res.render('fruits/index.ejs', {fruits: allFruits});
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
