
const Tour = require("../models/tourModel");




//-----------------------------------------------
//MIDDLEWARE functions

//TOP 5 CHEAP TOURS
exports.topCheapTours = (req, res, next) => {

    // req.query.limit = '5';
    // req.query.sort = '-ratingsAverage,price';
    // req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    //NOT WORK as req.query no longer being mutable in express v5++


    //one way, USE URLSearchParams
    // const query = new URLSearchParams(req.query);
    // query.set('limit', '5');
    // query.set('sort', '-ratingsAverage,price');
    // query.set('fields', 'name,price,ratingsAverage,summary,difficulty');
    // req.url = `${req.path}?${query.toString()}`;
    // console.log(req.url);

    //another way, use req.customQuery
    req.customQuery = {
        sort: '-ratingsAverage,price',
        limit: 5,
        fields: 'name,price,ratingsAverage,summary,difficulty'
    }

    console.log(req.customQuery);
    next();
}


//-----------------------------------------------



//GET TOURS
exports.getAllTours = async (req, res) => {
    try {

        console.log("req.query", req.query); //to get the query parameters
        //{duration: '5',difficulty: 'easy',maxGroupSize: '4' }

        //CHANGE THE QUERY
        const fullQuery = { ...req.query, ...(req.customQuery || {}) };
        console.log("fullQuery", fullQuery);


        //NORMAL METHOD
        // const tours = await Tour.find(req.query);
        //MONGOOSE METHOD
        // const tours = await Tour.find().where('duration').gt(5).where('difficulty').equals('easy');

        //------------------------------------------------------------------------------------------------------------------------
        //BUILD THE QUERY
        //------------------------------------------------------------------------------------------------------------------------
        //FILTERING

        //as filtering obj can have 'page' or 'sort', we can't use .find() method
        //shalow copy of req.query
        let queryObj = { ...fullQuery };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        //------------------------------------------------------------------------
        //ADVANCE FILTERING

        // duration[gte] = 5
        //         ↓
        // { duration: { gte: "5" } } 
        //this is happen after we extend the query object
        // by the line "app.set('query parser', 'extended');" in app.js

        //{duration: {$gte: '5'},difficulty: 'easy' }
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        //this will replace the gte, gt, lte, lt with $gte, $gt, $lte, $lt

        queryObj = JSON.parse(queryStr);
        //------------------------------------------------------------------------        
        //FINAL QUERY OBJ

        console.log("final query", queryObj);

        let query = Tour.find(queryObj);
        //we can't await the query, as it will return the query object; so we can't use pagination, sorting, etc later
        //------------------------------------------------------------------------------------------------------------------------

        //SORTING
        if (fullQuery.sort && fullQuery.sort.trim() !== '') {
            //sort('price ratingAverage') //so we need to split this
            const sortBy = fullQuery.sort.split(',').join(' ')
            console.log("sortBy", sortBy);
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }
        //----------------------------------------------------------------------------------------------------------------
        //FIELD LIMITING
        if (fullQuery.fields) {
            const fields = fullQuery.fields.split(',').join(' ');
            console.log("fields", fields);
            query = query.select(fields);
        }
        // else {
        //     query = query.select('-__v'); //to hide the __v field
        // }



        //------------------------------------------------------------------------------------------------------------------------  
        //PAGINATION
        const page = fullQuery.page * 1 || 1;
        const limit = fullQuery.limit * 1 || 100;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);

        if (fullQuery.page) {
            const numTours = await Tour.countDocuments(queryObj);
            console.log("numTours", numTours);
            if (skip >= numTours) {
                throw new Error("This page does not exist");
            }
        }



        //------------------------------------------------------------------------------------------------------------------------  
        // query.sort().select().skip().limit(); -> so we can chain methods
        //EXECUTE THE QUERY
        const tours = await query;
        // const tours = await Tour.find(); //to get all the tours
        res.status(200).json({
            status: "Success",
            requesTime: req.requestTime,
            results: tours.length,
            data: {
                tours
            }
        })
    } catch (err) {
        res.status(404).json({
            status: "Fail",
            message: err.message
        })
    }
}



//-----------------------------------------------
//CREATE TOUR
exports.createTour = async (req, res) => {
    try {
        // console.log(req.body);
        // const newTour = new Tour(req.body);
        // newTour.save();
        //but can use .create to Tour model directly
        const newTour = await Tour.create(req.body);  //to create a new tour
        res.status(201).json({
            status: "Success",
            requesTime: req.requestTime,
            data: {
                tour: newTour
            }
        })
    } catch (err) {//this will catch the validation errors, i.e. rejected promises
        res.status(400).json({
            status: "Fail",
            message: err.message
        })
    }


}

//-----------------------------------------------
//GET TOUR BY ID
exports.getTourbyId = async (req, res) => {
    try {
        // console.log(req.params);
        // const tour = await Tour.findOne({_id: req.params.id});
        const tour = await Tour.findById(req.params.id)
        res.status(200).json({
            status: "Success",
            requesTime: req.requestTime,
            data: {
                tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: "Fail",
            message: err.message
        })
    }
}


//-----------------------------------------------
//UPDATE TOUR
exports.updateTourbyId = async (req, res) => {
    try {
        // console.log(req.params);

        const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({
            status: "Success",
            requesTime: req.requestTime,
            data: {
                tour: updatedTour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: "Fail",
            message: err.message
        })
    }
}

//-----------------------------------------------
//DELETE TOUR
exports.deleteTourbyId = async (req, res) => {
    try {
        // console.log(req.params);
        const deletedTour = await Tour.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: "Success",
            requesTime: req.requestTime,
            data: null
        })
    } catch (err) {
        res.status(404).json({
            status: "Fail",
            message: err.message
        })
    }
}


