const AppError = require("./../utils/appError");

//----------------------------------------------------
//CONVERTING OPERATIONAL ERROR
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    //Object.values() will convert object to array
    //for eg-> {name: "name should not be empty", price: "price should not be empty"} will be converted to ["name should not be empty", "price should not be empty"]
    const message = `Invalid input data.\n${errors.join('\n')}`;
    return new AppError(message, 400);
}
const handleJWTError = () => {
    return new AppError("Invalid token. Please log in again!", 401);
}
const handleJWTExpiredError = () => {
    return new AppError("Your token has expired! Please log in again.", 401);
}


//----------------------------------------------------  

//SEND ERROR RESPONSE

//development
const sendErrorDev = (err, req, res) => {

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        // error: err

    })
}

//production
const sendErrorProd = (err, req, res) => {
    //only in operational error will send to client
    //error like- invalid id, wrong password, validation, etc
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    }
    //programmer error (unknown error, non-operational error)
    //error like- server crash, database crash, etc
    else {
        // console.error("error", err);
        res.status(500).json({
            status: "error",
            message: "something went wrong",
        })
    }
}

//----------------------------------------------------

//GLOBAL ERROR HANDLER  
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";


    if (process.env.NODE_ENV === 'development') {
        let error = err;
        if (error.name === 'CastError' || error.code === 11000 || error.name === 'ValidationError' || error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            error.statusCode = 400;
            error.status = 'fail';
        }

        sendErrorDev(error, req, res);
    }
    else if (process.env.NODE_ENV === 'production') {
        let error = err;
        if (error.name === 'CastError') error = handleCastErrorDB(error); //error like- invalid id
        if (err.code === 11000) error = handleDuplicateFieldsDB(error); //error like- duplicate field
        if (err.name === 'ValidationError') error = handleValidationErrorDB(error); //error like- validation
        if (err.name === 'JsonWebTokenError') error = handleJWTError(); //error like- invalid token
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(); //error like- token expired
        // console.log(error);
        sendErrorProd(error, req, res);
    }

}