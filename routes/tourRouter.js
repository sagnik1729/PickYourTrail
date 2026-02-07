const express = require("express");
const { getAllTours, createTour, getTourbyId, updateTourbyId, deleteTourbyId } = require("../controllers/tourController");
const { topTours, getTourStat, getMonthlyPlan } = require("../controllers/tourController");


//-----------------------------------------------
const tourRouter = express.Router();




//-----------------------------------------------

//ROUTES


tourRouter.route("/")
    .get(getAllTours)
    .post(createTour)

tourRouter.get('/topTours', topTours, getAllTours)
//we need to write this route before the '/:id' route else it will override the '/:id' route

tourRouter.get("/tourStats", getTourStat)

tourRouter.get("/monthlyPlan/:year", getMonthlyPlan)

// params-> '/:id/:x{/:y}' -> here id and x are params, and y is optional
tourRouter.route("/:id")
    .get(getTourbyId)
    .patch(updateTourbyId)
    .delete(deleteTourbyId)



//-----------------------------------------------

module.exports = tourRouter;