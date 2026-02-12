const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");

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
    maxBatchSize: {
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
        default: 0,
        min: [0, "Rating must be above 0.0"],
        max: [5, "Rating must be below 5.0"],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price //100<200 -> this will true
                //the this refers to the current document, only access in creating new document, not in update
            },
            message: "Discount price ({VALUE}) should be below regular price"

        }
    },
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
    },
    slug: String
},
    {
        toJSON: { virtuals: true },//each time data o/p as json, it will include virtuals
        toObject: { virtuals: true } //each time data o/p as object, it will include virtuals
    }
)


//--------------------------------------------------------------------
//VIRTUAL PROPERTY
tourSchema.virtual("duartionInWeeks").get(function () {
    return this.duration / 7
})
//we can't use virtuals in query middleware, as it is not a document


//-------------------------------------------------------------
//MONGOOSE MIDDLEWARE


//DOCUMENT MIDDLEWARE 
tourSchema.pre("save", function () { //this triggered before the document is saved i.e. save() or create()
    // console.log(this);
    //'this' points to the current document-> including virtual properties
    this.slug = slugify(this.name, { lower: true });

})

tourSchema.post("save", function (doc) {
    // console.log(doc.slug);//doc is the current document, which is just saved

})

//-------------------------------------------------------------
//QUERY MIDDLEWARE

tourSchema.pre(/^find/, function () { //this triggered before the query is executed
    this.find({
        secretTour: { $ne: true },
        startDates: { $gte: new Date() }
    });
    // this.find({ duartionInWeeks: { $gte: 0 } }) //not work to filter by a virtual property in your query middleware
    // this.start = Date.now();
})

tourSchema.post(/^find/, function (docs) {
    // console.log(`Query took ${Date.now() - this.start} milliseconds`);
})


//-------------------------------------------------------------
//AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function () {
    this.pipeline().unshift({
        $match: {
            secretTour: { $ne: true },
            startDates: { $gte: new Date() }
        }
    });
    // this will add { $match: { secretTour: { $ne: true } } } to the beginning of the pipeline-> unshift mean add to the beginning for each aggregation

})

//------------------------------------------------------------
//TOUR MODEL
const Tour = mongoose.model("Tour", tourSchema);


module.exports = Tour;

