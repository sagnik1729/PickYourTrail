// console.log("this is for testing")
const express = require("express");
const router = require("./routes/indexRouter");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const morgan = require("morgan");


//--------------------------------------------------------------------------------------------------
//INITIALIZATION


const app = express();


//----------------------------------------------------------------------------------------------
//MIDDLEWAREs

//this will allow the use of query parameters
app.set('query parser', 'extended');


//json parser
app.use(express.json());

//serving static files
app.use(express.static(`${__dirname}/public`));
// console.log(__dirname); //to get the path of the current directory

if (process.env.NODE_ENV === 'development') {

    //morgan-> this is a http request logger
    app.use(morgan("dev"));
}


//custom middleware
app.use((req, res, next) => {
    // console.log("hello from middleware");
    // console.log(req.method, req.url); //this will get my morgan
    req.requestTime = new Date().toLocaleString();
    console.log(req.requestTime);
    next();
})





//--------------------------------------------------------------------------------------------------
//ROUTES

app.use("/api/v1", router);

//----------------------------------------------------------------------------------------------
// ERROR HANDLERS

app.use((req, res, next) => {
    // const err = new Error(`can't find ${req.originalUrl} on this server`);
    // err.statusCode = 404;
    // err.status = "fail";
    // next(err);
    //if any argument pass in next(), the next middleware will not be called, straight to error handler

    next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
    //this helps to set err.message, err.statusCode; 

})


//this is a global error handler
app.use(globalErrorHandler)

//--------------------------------------------------------------------------------------------------


module.exports = app;





