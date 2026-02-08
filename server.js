//UNCAUGHT EXCEPTION

process.on("uncaughtException", err => {
    // errors occour in syncronous code, but not handled anywhere
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err.name, err.message);

    process.exit(1);

})
//declare this before importing the app

//----------------------------------------------------------------------------------

// PRE - REQUISITES
const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

//--------------------------------------------------------------------------------------------------
//INITIALIZATION

dotenv.config({ path: './config.env' });//to load the config.env file and set the environment variables



//----------------------------------------------------------------------------------





//CONNECT WITH DATABASE
const DB = process.env.DATABASE_URL.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB)
    .then((conn) => {
        // console.log("DB connected to:", conn.connection);
        console.log("DB connection successful");
    })
// .catch(err => console.error("DB connection failed:", err)); //commented because we want to handle the error in the global error handler




//--------------------------------------------------------------------------------------------------
//SERVER
// console.log(app.get("env"));
const PORT = 3000 || process.env.PORT;
const server = app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    console.log(`we are currently in ${process.env.NODE_ENV} mode`);

});

//----------------------------------------------------------------------------------
//UNHANDLED REJECTION
process.on("unhandledRejection", err => {
    //Errors outside the express app
    //unhandled promise rejection; if promise is rejected outside the express app
    //eg-> database connection error, network error,
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// console.log(x)


// git add config.env controllers public routes server.js app.js package.json models
// git commit -m "initial commit"
// git push -u origin main