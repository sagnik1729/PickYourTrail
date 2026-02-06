const express = require("express");
const { getAllTours, createTour, getTourbyId, updateTourbyId, deleteTourbyId, topCheapTours } = require("../controllers/tourController");

// const { topTours } = require("../controllers/tourController");


//-----------------------------------------------
const tourRouter = express.Router();




//-----------------------------------------------

//ROUTES

tourRouter.get('/topTours', topCheapTours, getAllTours)

tourRouter.route("/")
    .get(getAllTours)
    .post(createTour)


// params-> '/:id/:x{/:y}' -> here id and x are params, and y is optional
tourRouter.route("/:id")
    .get(getTourbyId)
    .patch(updateTourbyId)
    .delete(deleteTourbyId)



//-----------------------------------------------

module.exports = tourRouter;