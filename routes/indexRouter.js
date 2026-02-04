const express = require("express");
const tourRouter = require("./tourRouter");
const userRouter = require("./userRouter");


//---------------------------------------
const router = express.Router();



//---------------------------------------

//---------------------------------------
//ROUTES MIDDLEWARE


//tour router
router.use('/tours', tourRouter);
//this is a middleware, mounting the router


//user router
router.use('/users', userRouter);


//---------------------------------------
module.exports = router;