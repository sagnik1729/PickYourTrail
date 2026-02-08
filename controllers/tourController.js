
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");


//-----------------------------------------------
//MIDDLEWARE functions

//TOP 5  TOURS
exports.topTours = (req, res, next) => {

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
exports.getAllTours = catchAsync(async (req, res, next) => {
    //CHANGE THE QUERY
    const fullQuery = { ...req.query, ...(req.customQuery || {}) };

    //----------------------------------------------------------------------------------------------------------------  
    //API FEATURES
    const features = new APIFeatures(Tour.find(), fullQuery)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    //------------------------------------------------------------------------------------------------------------------------  
    //EXECUTE THE QUERY
    const tours = await features.query;
    // const tours = await Tour.find(); //to get all the tours
    res.status(200).json({
        status: "Success",
        requesTime: req.requestTime,
        results: tours.length,
        data: {
            // tours
            tours: tours.length === 0 ? "No tours found" : tours
        }
    })

})



//-----------------------------------------------
//CREATE TOUR
exports.createTour = catchAsync(async (req, res, next) => {

    const newTour = await Tour.create(req.body);  //to create a new tour
    res.status(201).json({
        status: "Success",
        requesTime: req.requestTime,
        data: {
            tour: newTour
        }
    })

})

//-----------------------------------------------
//GET TOUR BY ID
exports.getTourbyId = catchAsync(async (req, res, next) => {
    // console.log(req.params);
    // const tour = await Tour.findOne({_id: req.params.id});
    const tour = await Tour.findById(req.params.id)
    if (!tour) {
        return next(new AppError(`No tour found with id: ${req.params.id}`, 404));
    }
    res.status(200).json({
        status: "Success",
        requesTime: req.requestTime,
        data: {
            tour
        }
    })

})


//-----------------------------------------------
//UPDATE TOUR
exports.updateTourbyId = catchAsync(async (req, res, next) => {


    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!updatedTour) {
        return next(new AppError(`No tour found with id: ${req.params.id}`, 404));
    }
    res.status(200).json({
        status: "Success",
        requesTime: req.requestTime,
        data: {
            tour: updatedTour
        }
    })

})

//-----------------------------------------------
//DELETE TOUR
exports.deleteTourbyId = catchAsync(async (req, res, next) => {

    // console.log(req.params);
    const deletedTour = await Tour.findByIdAndDelete(req.params.id)
    if (!deletedTour) {
        return next(new AppError(`No tour found with id: ${req.params.id}`, 404));
    }
    res.status(204).json({
        status: "Success",
        requesTime: req.requestTime,
        data: null
    })

})

//-----------------------------------------------
//GET TOUR STATS
//aggregate method is used to perform complex queries
exports.getTourStat = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
            //this will match all the tours with rating greater than or equal to 4.5
        },
        {
            $group: {
                // _id: null, //null mean it will not group by any field
                _id: { $toUpper: "$difficulty" },
                numTours: { $sum: 1 },
                avgRating: { $avg: "$ratingsAverage" },
                numRatings: { $sum: "$ratingsQuantity" },
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" },

            }
        },
        {
            $sort: { avgPrice: 1 }
        },
        // {
        //     $match: { _id: { $ne: "EASY" } }
        //     //after grouping, we will match all the non-easy tours
        // }
    ])

    res.status(200).json({
        status: "Success",
        requesTime: req.requestTime,
        data: {
            stats
        }
    })

})

//--------------------------------------------------------------

//GET MONTHLY PLAN
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const monthlyPlan = await Tour.aggregate([
        {
            $unwind: "$startDates"
            //unwind will break down the array into multiple documents, and then each document will be processed separately
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: "$startDates" },
                numTour: { $sum: 1 },
                tours: { $push: "$name" }
            }
        },
        {
            $addFields: {
                month: "$_id", //this will add a new field called month with the value of _id

            }
        },
        {
            $project: {
                _id: 0, //this will remove the _id field
            }
        },
        {
            $sort: {
                numTour: -1
            }
        },
        {
            $limit: 6
        },


    ])

    res.status(200).json({
        status: "Success",
        requesTime: req.requestTime,
        data: {
            monthlyPlan
        }
    })

})
