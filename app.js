// console.log("this is for testing")
const express = require("express");
const router = require("./routes/indexRouter");
const morgan = require("morgan");


//--------------------------------------------------------------------------------------------------
//INITIALIZATION


const app = express();



//----------------------------------------------------------------------------------------------
//MIDDLEWAREs

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

app.route("/test")
    .get((req, res) => {
        // res.status(200).send("hello world");
        res.status(200).json({
            messege: "hello world"
        })
    })
    .post((req, res) => {

        res.status(200).json({
            messege: "success",
            data: req.body
        })
    })



app.use("/api/v1", router);





//--------------------------------------------------------------------------------------------------


module.exports = app;





