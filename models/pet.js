// Require the Mongoose package
const mongoose = require('mongoose');
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