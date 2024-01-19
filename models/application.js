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