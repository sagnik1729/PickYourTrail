
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");



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



        //----------------------------------------------------------------------------------------------------------------  
        //API FEATURES
        const features = new APIFeatures(Tour.find(), fullQuery)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        //------------------------------------------------------------------------------------------------------------------------  
        // query.sort().select().skip().limit(); -> so we can chain methods
        //EXECUTE THE QUERY
        const tours = await features.query;
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
            message: err.message,
            stack: err.stack
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


