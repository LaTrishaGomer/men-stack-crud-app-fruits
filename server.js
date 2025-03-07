//dependencies
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const Fruit = require('./models/fruit');
const methodOverride = require('method-override');
const morgan = require('morgan');


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
app.use(methodOverride('_method'))
//method override reads the "_method" query param for 
//DELETE or PUT requests
app.use(morgan('dev'));
//static asset middleware = use to send static assests(css,images and dom manipulation JavaScript) to the client
app.use(express.static('public'));

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

app.get("/fruits/:fruitId", async (req, res) => {
    const foundFruit = await Fruit.findById(req.params.fruitId);
    res.render("fruits/show.ejs", { fruit: foundFruit });
  });
  
  //delete route, once matched by server.js, sends a
  //action to MongoDB to delete a docuemtn using its id to dins and delete it
  app.delete('/fruits/:fruitId', async (req, res) => {
    await Fruit.findByIdAndDelete(req.params.fruitId);
    res.redirect('/fruits');
  });

  //edit route - used to send a page to the client with
  //an edit form pre-filled out with fruit details
 // so the user can edit the fruit and submit the form
 app.get('/fruits/:fruitId/edit', async(req, res) => {
    //1. look up the fruit by it's id
    const foundFruit = await Fruit.findById(req.params.fruitId);
    //2. respond with a "edit" template with an edit form
    res.render('fruits/edit.ejs', { fruit: foundFruit });
 });

 //update route - used to capture edit from submissions
 //from the client and send updates to MongoDB
// server.js

app.put("/fruits/:fruitId", async (req, res) => {
    // Handle the 'isReadyToEat' checkbox data
    if (req.body.isReadyToEat === "on") {
      req.body.isReadyToEat = true;
    } else {
      req.body.isReadyToEat = false;
    }
    
    // Update the fruit in the database
    await Fruit.findByIdAndUpdate(req.params.fruitId, req.body);
  
    // Redirect to the fruit's show page to see the updates
    res.redirect(`/fruits/${req.params.fruitId}`);
  });
  

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
