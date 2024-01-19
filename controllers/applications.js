/* 
---------------------------------------------------------------------------------------
NOTE: Remember that all routes on this page are prefixed with `localhost:3000/applications`
---------------------------------------------------------------------------------------
*/


/* Require modules
--------------------------------------------------------------- */
const express = require('express')
const router = express.Router()


/* Require the db connection, and models
--------------------------------------------------------------- */
const db = require('../models')


/* Routes
--------------------------------------------------------------- */
// Index Route (All Applications): 
// GET localhost:3000/applications/
router.get('/', (req, res) => {
    db.Pet.find(
        {},
        { applications: true, _id: false }
    )
        .then(pets => {
            // format query results to appear in one array, 
            // rather than an array of objects containing arrays 
            const flatList = []
            for (let pet of pets) {
                flatList.push(...pet.applications)
            }
            res.render('applications/app-index', { apps: flatList })
        })
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
            res.render('applications/app-details', { app: pet.applications[0] })
        })
});

// Destroy Route: DELETE localhost:3000/applications/:id
router.delete('/:id', (req, res) => {
    db.Pet.findOneAndUpdate(
        { 'applications._id': req.params.id },
        { $pull: { applications: { _id: req.params.id } } },
        { new: true }
    )
        .then(() => res.redirect('/applications'))
});

// New Route: GET localhost:3000/applications/new/:petId
router.get('/new/:petId', async (req, res) => {
    const pet = await db.Pet.findById(req.params.petId)
    res.render('applications/new-form', { pet: pet })
})

// Create Route: POST localhost:3000/applications/
router.post('/create/:petId', (req, res) => {
    db.Pet.findByIdAndUpdate(
        req.params.petId,
        { $push: { applications: req.body } },
        { new: true }
    )
        .then(() => res.redirect('/applications'))
});


/* Export these routes so that they are accessible in `server.js`
--------------------------------------------------------------- */
module.exports = router