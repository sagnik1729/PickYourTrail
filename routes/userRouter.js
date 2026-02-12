const express = require("express");


const { getAllUsers, createUser, getUserbyId, getUserbyUserName, updateUserbyId, deleteUserbyId } = require("../controllers/userController");
const { getMe, updateMe, deleteMe } = require("../controllers/userController");
const { signUp, logIn, protect, restrictTo, forgetPassword, resetPassword, updatePassword } = require('./../controllers/authController');

//-----------------------------------------------
const userRouter = express.Router();


//MIDDLEWAREs







//-----------------------------------------------
//ROUTES

userRouter.post('/signup', signUp)
userRouter.post('/login', logIn)

userRouter.post('/forgotPassword', forgetPassword)
userRouter.patch('/resetPassword/:token', resetPassword)

// below all are protected route
userRouter.use(protect)

userRouter.get('/user/:username', getUserbyUserName)

userRouter.get('/me', getMe)
userRouter.patch('/updateMe', updateMe)//only name, email, username can be updated   
userRouter.delete('/deleteMe', deleteMe)

userRouter.patch('/updatePassword', updatePassword)



userRouter.route("/")
    .get(restrictTo('lead-guide', 'guide', 'admin'), getAllUsers)
    .post(restrictTo('admin'), createUser)


userRouter.use(restrictTo('lead-guide', 'admin'))
userRouter.route("/:id")
    .get(getUserbyId)
    .patch(updateUserbyId)
    .delete(deleteUserbyId)





//-----------------------------------------------

module.exports = userRouter;