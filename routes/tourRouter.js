const express = require("express");
const { getAllTours, createTour, getTourbyId, updateTourbyId, deleteTourbyId } = require("../controllers/tourController");
const { checkId, checkBody } = require("../controllers/tourController");



//-----------------------------------------------
const tourRouter = express.Router();

//param middleware
//this is only applied if the route is '/tours/:id'
tourRouter.param('id', checkId);


//-----------------------------------------------

//ROUTES
tourRouter.route("/")
    .get(getAllTours)
    .post(checkBody, createTour)

tourRouter.use(checkId);
// params-> '/:id/:x{/:y}' -> here id and x are params, and y is optional
tourRouter.route("/:id")
    .get(getTourbyId)
    .patch(updateTourbyId)
    .delete(deleteTourbyId)



//-----------------------------------------------

module.exports = tourRouter;