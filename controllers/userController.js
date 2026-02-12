const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}

//GET ME
//only logged in user can get me
exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        status: "success",
        data: {
            user
        }
    })
})

//UPDATE ME
//only logged in user can update me
exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) return next(new AppError("This route is not for password update", 400));

    const filteredBody = filterObj(req.body, 'name', 'email', 'userName');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })
})


//DELETE ME
//only logged in user can delete me
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: "success",
        data: null
    })
})

//--------------------------------------------------------------------------------------------------------------------
//GET ALL USERS
//admin can get all users
exports.getAllUsers = catchAsync(async (req, res) => {
    const features = new ApiFeatures(User.find(), req.query).filter()
    const users = await features.query;
    res.status(200).json({
        status: "success",
        data: {
            users
        }
    })
})


//CREATE USER
//admin can create user
exports.createUser = catchAsync(async (req, res) => {
    const newUser = await User.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            user: newUser
        }
    })
})

//GET USER BY ID
//admin can get user
exports.getUserbyId = catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.status(200).json({
        status: "success",
        data: {
            user
        }
    })
})




//UPDATE USER
//admin can update user
exports.updateUserbyId = catchAsync(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        status: "success",
        data: {
            user
        }
    })
})

//DELETE USER
//admin can delete user
exports.deleteUserbyId = catchAsync(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: "success",
        data: null
    })
})


//--------------------------------------------------------------------------------------------------------------------
//GET USER BY USERNAME
//all can get user
exports.getUserbyUserName = catchAsync(async (req, res) => {
    const user = await User.findOne({ userName: req.params.username });
    res.status(200).json({
        status: "success",
        data: {
            user
        }
    })
})
