const mongoose = require("mongoose");
const validator = require("validator");


const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have a name"],
        unique: true,
        minlength: [10, "A tour name must have more or equal then 10 characters"],
        maxlength: [40, "A tour name must have less or equal then 40 characters"],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a group size"]
    },
    difficulty: {
        type: String,
        enum: {
            values: ["easy", "medium", "difficult"],
            message: "Difficulty is either: easy, medium, difficult"
        },
        required: [true, "A tour must have a difficulty"]
    },
    ratingsAverage: {
        type: Number,
        default: 0
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have a description"]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "A tour must have a cover image"]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false //this will hide the createdAt field from the response
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false,
        select: false
    },
    __v: {
        type: Number,
        select: false
    }
});

const Tour = mongoose.model("Tour", tourSchema);


module.exports = Tour;

