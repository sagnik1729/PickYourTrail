const fs = require("fs");





const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

//-----------------------------------------------
//MIDDLEWARE functions

exports.checkId = (req, res, next, val) => {
    console.log(`tour id is: ${val}`);
    const tour = tours.find(el => el.id === val * 1);
    if (!tour) {
        return res.status(404).json({
            status: "Fail",
            data: "No tour found with that ID"
        })
    }

    req.tour = tour;
    next();
}


exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: "Fail",
            message: "Missing name or price"
        })
    }
    next();
}

//-----------------------------------------------
//GET TOURS
exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: "Success",
        results: tours.length,
        requesTime: req.requestTime,
        data: {
            tours
        }
    })
}



//-----------------------------------------------
//CREATE TOUR
exports.createTour = (req, res) => {
    // console.log(req.body);
    const newId = tours[tours.length - 1].id + 1;
    const newTour = { id: newId, ...req.body };
    tours.push(newTour);
    fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        err => {

            res.status(201).json({
                status: "Success",
                requesTime: req.requestTime,
                data: {
                    tour: newTour
                }
            })
        })
}

//-----------------------------------------------
//GET TOUR BY ID
exports.getTourbyId = (req, res) => {
    // console.log(req.params);
    const tour = req.tour;
    res.status(200).json({
        status: "Success",
        requesTime: req.requestTime,
        tour
    })
}


//-----------------------------------------------
//UPDATE TOUR
exports.updateTourbyId = (req, res) => {
    const tour = req.tour;
    const newTour = { ...tour, ...req.body } //spread operator
    tours[tours.indexOf(tour)] = newTour;

    fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        err => {
            // console.log(err);
            res.status(200).json({
                status: "Success",
                requesTime: req.requestTime,
                tour: newTour
            })
        })
}

//-----------------------------------------------
//DELETE TOUR
exports.deleteTourbyId = (req, res) => {
    const id = req.params.id * 1;

    const newTours = tours.filter(el => el.id !== id); //to remove the tour

    fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`,
        JSON.stringify(newTours),
        err => {
            // console.log(err);
            res.status(204).json({
                status: "Success",
                requesTime: req.requestTime,
                data: null
            })
        })
}