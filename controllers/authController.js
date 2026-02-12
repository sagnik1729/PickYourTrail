const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const crypto = require('crypto');
const { promisify } = require('util');

//------------------------------------------------

const jwt = require('jsonwebtoken'); //https://www.jwt.io/ to varify the token

//----------------------------------------------------------------


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}


const signToken = (id) => {
    return jwt.sign(
        { id },//payload
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )
}


//------------------------------------------------
//SIGN UP
exports.signUp = catchAsync(async (req, res, next) => {
    // const newUser=await User.create(req.body);
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        userName: req.body.userName
        //i will not take other properties from req.body, like role
    });

    const message = `Welcome to the PickYourTrail Family ${newUser.name}. We are happy to have you with us.`;
    const url = `${req.protocol}://${req.get('host')}/me`;
    try {
        await new Email(newUser, url, message).sendWelcome();
        createSendToken(newUser, 201, res);

    } catch (err) {
        return next(new AppError(err.message, 500));
    }
})


//------------------------------------------------
//LOG IN
exports.logIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    //CHECK BOTH EMAIL AND PASSWORD PROVIDED
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    //CHECK IF USER EXISTS && PASSWORD IS CORRECT
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    //IF EVERYTHING OK, SEND TOKEN TO CLIENT

    createSendToken(user, 200, res);
})




//------------------------------------------------
//PROTECT ROUTES
exports.protect = catchAsync(async (req, res, next) => {
    //GET TOKEN, CHECKING IT EXISTS
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        return next(new AppError('You are not logged in! Please log in to get access', 401));
    }

    const token = req.headers.authorization.split(' ')[1];
    // console.log(token);

    //VALIDATE TOKEN
    const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET,
    );
    // console.log(decoded); //{ id: '5f8d1b0e9b6a7a7a7a7a7a7a' , iat: 161, exp: 161}

    //CHECK IF USER EXISTS IN DB
    const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');

    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist', 401));
    }


    //CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
    if (currentUser.changePasswordAfter(decoded.iat, currentUser.passwordChangedAt)) { //if this is true-> password changed
        return next(new AppError('User recently changed password! Please log in again', 401));
    }


    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;

    next()
})



//------------------------------------------------
//RESTRICTED ROUTES
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles->['admin','lead-guide'], req.user.role->'user'
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403))
        }
        next()
    }

}


//--------------------------------------------------
//FORGET PASSWORD
exports.forgetPassword = catchAsync(async (req, res, next) => {
    //GET THE USER BY EMAIL
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address', 404));
    }


    //GENERATE RANDOM RESET TOKEN

    const resetToken = user.passwordResetTokenFn();
    await user.save({ validateBeforeSave: false }); //as passwordConfirm is undefined at this moment


    //SEND IT TO USER'S EMAIL
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    //http://localhost:3000/api/v1/users/resetPassword/123456789

    const message = `
        Hi ${user.name.split(' ')[0]},

        We received a request to reset your password.

        Click the link below to set a new password:
        ${resetURL}

        This link will expire in 10 minutes.

        If you didn’t request this, you can safely ignore this email.

        ---  Team PickYourTrail
        `

    try {

        await new Email(user, resetURL, message).sendPasswordReset();
        res.status(200).json({
            status: "success",
            message: "Token sent to email!"

        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }

})


//--------------------------------------------------
//RESET PASSWORD
exports.resetPassword = catchAsync(async (req, res, next) => {
    //GET USER BASED ON THE TOKEN
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');


    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } }).select('+password');;
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    //CHECK IF NEW PASSWORD AND OLD PASSWORD ARE SAME
    if (await user.correctPassword(req.body.password, user.password)) {
        //mean new password and old password are same
        return next(new AppError('Password cannot be same as old password', 400));
    }

    //SET NEW PASSWORD
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    //PASSWORD CHANGED AT WILL UPDATE BY DEFAULT FOR PRE SAVE MIDDLEWARE
    await user.save();


    //LOG THE USER IN, SEND JWT
    createSendToken(user, 200, res);

})


//RESET PASSWORD BY ME
exports.updatePassword = catchAsync(async (req, res, next) => {
    //GET USER FROM COLLECTION
    const user = await User.findById(req.user.id).select('+password');
    //CHECK IF POSTED CURRENT PASSWORD IS CORRECT
    if (!await user.correctPassword(req.body.oldPassword, user.password)) {
        return next(new AppError('Your current password is wrong', 401));
    }

    //CHECK IF NEW PASSWORD AND OLD PASSWORD ARE SAME
    if (req.body.newPassword === req.body.oldPassword) {
        return next(new AppError('New password cannot be same as old password', 400));
    }

    //UPDATE PASSWORD
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;

    //IF OLD PASSWORD and NEW PASSWORD ARE SAME


    //PASSWORD CHANGED AT WILL UPDATE BY DEFAULT FOR PRE SAVE MIDDLEWARE
    await user.save();

    //LOG USER IN, SEND JWT
    createSendToken(user, 200, res);

})