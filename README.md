# MEN Stack - Part 3 (Mongoose Relationships)
<img src="https://i.imgur.com/2ARbclT.png" width="100%"/>


## Background
Yesterday we finished building out all of our RESTful routes, as well as a few additional routes. Today we'll be implementing Mongoose relationships in our Express app. We'll build RESTful routes to perform some CRUD operations on a Mongo sub-document!


## Set Up
To get the code from where we left off yesterday, you can use the local copy of your code or you can you clone this repository. 

If you clone the repository make sure you open up VS Code in the correct folder:
```
cd Furever-Friends/part-3
code .
```

You'll also need to install all the dependencies. You can do this by running:
```
npm i
```


## 1. Update the Route Table
Let's update our route table from yesterday. We already have all of our RESTful routes for the `pets` URIs. Today we'll be working on RESTful routes for the `applications` URI.

|       **URL**               | **REST Route** | **HTTP Verb** | **CRUD Action** |   **EJS View(s)**        | **Created Yet?**  |
| --------------------------- | -------------- | ------------- | --------------- | ------------------------ | ----------------- |
| /                           |                | GET           | read            | home.ejs                 | YES               |
| /pets                       | index          | GET           | read            | pet-index.ejs            | YES               |
| /pets/:id                   | show           | GET           | read            | pet-details.ejs          | YES               |
| /pets/new                   | new            | GET           |                 | new-pet.ejs              | YES               |
| /pets                       | create         | POST          | create          |                          | YES               |
| /pets/:id/edit              | edit           | GET           | read            | edit-pet.ejs             | YES               |
| /pets/:id                   | update         | PATCH/PUT     | update          |                          | YES               |
| /pets/:id                   | destroy        | DELETE        | delete          |                          | YES               |
| /applications/              | index          | GET           | read            | app-index.ejs            | NO                |
| /applications/:id           | show           | GET           | read            | app-details.ejs          | NO                |
| /applications/new/:petId    | new            | GET           | read            | new-app.ejs              | NO                |
| /applications/create/:petId | create         | POST          | create          |                          | NO                |
| /applications/:id           | destroy        | DELETE        | delete          |                          | NO                |
| /seed                       |                | GET           | delete & create |                          | YES               |
| /about                      |                | GET           |                 | about.ejs                | YES               |
| /*                          |                | GET           |                 | 404.ejs                  | YES               |


## 2. Set Up the Mongoose Schemas
<ol>
<li>
<details>
<summary>In your models folder, create a file called <code>application.js</code> and add this code:</summary>

```js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicantName: {
    type: String,
    required: true
  },
  applicantEmail: {
    type: String,
    required: true
  },
  applicantPhone: {
    type: String,
    required: true
  },
  reasonForAdoption: {
    type: String,
    required: true
  },
  ownedPets: {
    type: Number,
    min: 0,
    default: 0
  },
  applicationDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = applicationSchema;
```
</details>
</li>

<li>
<details>
<summary>Embed the <code>applicationSchema</code> into the <code>petSchema</code> in <code>models/pet.js</code></summary>

```js
// Require the Mongoose package and applicationSchema
const mongoose = require('mongoose')
const applicationSchema = require('./application.js')

// Create a schema to define the properties of the pets collection
const petSchema = new mongoose.Schema({
	name: { type: String, required: true },
    age: { type: Number, min: 0, required: true },
    breed: { type: String, default: 'Unknown' },
    species: { type: String, enum: ['Dog', 'Cat'], required: true },
    city: { type: String, required: true },
    state: { type: String, maxLength: 2, required: true },
    photo: { type: String, required: true },
    description: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    dateAdded: { type: Date, default: Date.now },
	// the applications array can only accept objects that match the criteria specified
    // in the applicationSchema. In other words, the applications array can only accept applications
	applications: [applicationSchema]
});

// Export the schema as a Monogoose model. 
// The Mongoose model will be accessed in `models/index.js`
module.exports = mongoose.model('Pet', petSchema);
```
</details>
</li>
</ol>


## 3. Build Routes, Test with Postman
<ol>
<li>Create a new file in the <code>controllers</code> folder called <code>applications.js</code>. This will store all the routes for any URI prefixed with <code>/applications</code>.</li>

<li>
<details>
<summary>Add these routes into <code>controllers/applications.js</code>:</summary>

```js
/* 
---------------------------------------------------------------------------------------
NOTE: Remember that all routes on this page are prefixed with `localhost:3000/applications`
---------------------------------------------------------------------------------------
*/


/* Require modules
--------------------------------------------------------------- */
const express = require('express')
// Router allows us to handle routing outisde of server.js
const router = express.Router()


/* Require the db connection, and models
--------------------------------------------------------------- */
const db = require('../models')


/* Routes
--------------------------------------------------------------- */
// Index Route (All Applications): 
// GET localhost:3000/applications/
router.get('/', (req, res) => {
	db.Pet.find({}, { applications: true, _id: false })
        .then(pets => {
		    // format query results to appear in one array, 
		    // rather than an array of objects containing arrays 
	    	const flatList = []
	    	for (let pet of pets) {
	        	flatList.push(...pet.applications)
	    	}
	    	res.json(flatList)
		}
	)
});

// New Route: GET localhost:3000/applications/new
router.get('/new/:petId', (req, res) => {
    res.send('You\'ve reached the new route. You\'ll be making a new application for pet ' + req.params.petId)
})

// Create Route: POST localhost:3000/applications/
router.post('/create/:petId', (req, res) => {
    db.Pet.findByIdAndUpdate(
        req.params.petId,
        { $push: { applications: req.body } },
        { new: true }
    )
        .then(pet => res.json(pet))
});

// Show Route: GET localhost:3000/applications/:id
router.get('/:id', (req, res) => {
    db.Pet.findOne(
        { 'applications._id': req.params.id },
        { 'applications.$': true, _id: false }
    )
        .then(pet => {
	        // format query results to appear in one object, 
	        // rather than an object containing an array of one object
            res.json(pet.applications[0])
        })
});

// Destroy Route: DELETE localhost:3000/applications/:id
router.delete('/:id', (req, res) => {
    db.Pet.findOneAndUpdate(
        { 'applications._id': req.params.id },
        { $pull: { applications: { _id: req.params.id } } },
        { new: true }
    )
        .then(pet => res.json(pet))
});


/* Export these routes so that they are accessible in `server.js`
--------------------------------------------------------------- */
module.exports = router
```
</details>
</li>

<li>
<details>
<summary>Connect the applications controller to <code>server.js</code>:</summary>

```js
/* Require the routes in the controllers folder
--------------------------------------------------------------- */
const petsCtrl = require('./controllers/pets')
const appsCtrl = require('./controllers/applications')
```

Lower in the `server.js` file add the `/applications` routes:
```js
// This tells our app to look at the `controllers/applications.js` file 
// to handle all routes that begin with `localhost:3000/applications`
app.use('/applications', appsCtrl)
```
</details>
</li>

<li>Test the routes in Postman to ensure they are functional!</li>
</ol>


## 4. Build Views
<ul>
<li>We already have several EJS files in our <code>views</code> folder. To keep us organized and provide a clear separation of concerns between our schemas, create a folder in <code>views</code> called <code>applications</code></li>

<li>
<details>
<summary>Create <code>views/applications/new-form.ejs</code> and add this code:</summary>

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <%- include('../partials/head.ejs', {title: 'Create an Application | Furever Friends'}) %>
    <link rel="stylesheet" href="/styles/pet-form.css">
</head>

<body>
    <%- include('../partials/nav.ejs') %>

    <section class="hero">
        <h2>Adoption Application</h2>
        <h4><i>You're applying to adopt <a href="/pets/<%= pet._id %>"><%= pet.name %></a></i></h4>
    </section>

    <form action="/applications/create/<%= pet._id %>" method="POST">
        <label for="applicantName">Applicant Name:</label><br>
        <input type="text" id="applicantName" name="applicantName" required><br>

        <label for="applicantEmail">Applicant Email:</label><br>
        <input type="email" id="applicantEmail" name="applicantEmail" required><br>

        <label for="applicantPhone">Applicant Phone:</label><br>
        <input type="tel" id="applicantPhone" name="applicantPhone" required><br>

        <label for="reasonForAdoption">Reason for Adoption:</label><br>
        <textarea id="reasonForAdoption" name="reasonForAdoption" required></textarea><br>

        <label for="ownedPets">Number of Owned Pets:</label><br>
        <input type="number" id="ownedPets" name="ownedPets" min="0" value="0"><br>

        <input type="submit" value="Submit">
    </form>

    <%- include('../partials/footer.ejs') %>
</body>

</html>
```
**Important Note:** Look at how the relative path of our EJS partials changed.
</details>
</li>

<li>
<details>
<summary>Create <code>views/applications/app-index.ejs</code> and add this code:</summary>

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <%- include('../partials/head.ejs', {title: 'My Applications | Furever Friends'}) %>
    <link rel="stylesheet" href="/styles/pet-index.css">
</head>

<body>
    <%- include('../partials/nav.ejs') %>

    <main>
        <section class="listings">
            <ul>
                <% for (let app of apps) { %>
                <li>
                    <h4><%= app.applicantName %> - <%= app.applicantEmail %></h4>
                    <p>Created: <%= app.applicationDate %></p>
                    <a href="/applications/<%= app._id %>">Read More</a>
                </li>
                <% } %>
            </ul>
        </section>
    </main>

    <%- include('../partials/footer.ejs') %>
</body>

</html>
```
</details>
</li>

<li>
<details>
<summary>Create <code>views/applications/app-details.ejs</code> and add this code:</summary>

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <%- include('../partials/head.ejs', {title: 'My Applications | Furever Friends'}) %>
    <link rel="stylesheet" href="/styles/app-details.css">
</head>

<body>
    <%- include('../partials/nav.ejs') %>

    <section class="application">
        <h1>Applicant: <%= app.applicantName %></h1>
        <table>
            <tr>
                <th>
                    <h2>Email:</h2>
                </th>
                <td>
                    <h2><%= app.applicantEmail %></h2>
                </td>
            </tr>
            <tr>
                <th>
                    <h2>Phone:</h2>
                </th>
                <td>
                    <h2><%= app.applicantPhone %></h2>
                </td>
            </tr>
            <tr>
                <th>
                    <h2>Reason for adoption:</h2>
                </th>
                <td>
                    <h2><%= app.reasonForAdoption %></h2>
                </td>
            </tr>
            <tr>
                <th>
                    <h2>Number of pets:</h2>
                </th>
                <td>
                    <h2><%= app.ownedPets %></h2>
                </td>
            </tr>
            <tr>
                <th>
                    <h2>Date submitted:</h2>
                </th>
                <td>
                    <h2><%= app.applicationDate.toLocaleDateString() %></h2>
                </td>
            </tr>
        </table>
    </section>

    <%- include('../partials/footer.ejs') %>
</body>

</html>
```
</details>
</li>
</ul>


## 5. Adding Static Assets
<ul>
<li>
<details>
<summary>Create <code>app-details.css</code> and add this code:</summary>

```css
.application {
    margin: 2rem auto;
    height: 70vh;
    min-height: 300px;
    width: 60vw;
    min-width: 300px;
    border: 2px solid #ccc;
    padding: 40px;
    overflow-y: scroll;
}

.application h1 {
    text-align: center;
    margin-bottom: 2rem;
}

table {
    background-color: rgba(160, 159, 149, 0.5);
    width: 100%;
    height: 80%;
    border-radius: 1rem;
}

th {
    width: 45%;
    text-align: left;
    padding-left: 20%;
}

td {
    padding-left: 1rem;
}

td h2 {
    font-weight: 100;
}
```
</details>
</li>

<li>
<details>
	<summary>Expand this dropdown to get two images we can use in the <code>public/assets</code> folder:</summary>

- Right click on this image and save into your `public/assets` folder. This will be used as the background for the `404` page:
	
	<img width="50%" src="https://raw.git.generalassemb.ly/SEIR-Titans/Furever-Friends/solutions/part-3/public/assets/404.png?token=AAAGJGIHCIEFNJSE6SQTC4DFCQ5MK">

- Right click on this image and save into your `public/assets` folder. This will be used as the browser tab icon:
	
	<img width="50%" src="https://raw.git.generalassemb.ly/SEIR-Titans/Furever-Friends/solutions/part-3/public/assets/icon.png?token=AAAGJGLF5EAR4TEYTKRBL6DFCQ5OE">
	
	To use this image as a browser tab icon place this element in the `head.ejs` partial:
	```html
	<link rel="icon" href="/assets/icon.png">
	```
</details>
</li>
</ul>

	
## 6. You Do: Render the EJS files with Routes
1. Look through the routes that we've created and determine which routes will render EJS files, and which routes will redirect the user to a different page.
    - What will the new route render or redirect to?
    - What will the create route render or redirect to?
    - You can refer to the route table for help
1. Create a button on the show page for applications that allows you to delete the application
1. Update the nav partial so that it takes you to the index route for applications
1. Currently, we have no link to the new application route. Where would be a good place to create this link?


## Bonus
- Create edit and update routes for `applications`!
- How can we display all of a pet's adoption applications on the pet's details page?