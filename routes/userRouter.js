const express = require("express");


const { getAllUsers, createUser, getUserbyId, updateUserbyId, deleteUserbyId } = require("../controllers/userController");


//-----------------------------------------------
const userRouter = express.Router();


//MIDDLEWAREs

//param middleware
userRouter.param('id', (req, res, next, val) => {
    //this is only applied if the route is '/users/:id'
    console.log(`user id is: ${val}`);
    next();
})





//-----------------------------------------------

//ROUTES
userRouter.route("/")
    .get(getAllUsers)
    .post(createUser)



userRouter.route("/:id")
    .get(getUserbyId)
    .patch(updateUserbyId)
    .delete(deleteUserbyId)




//-----------------------------------------------

module.exports = userRouter;