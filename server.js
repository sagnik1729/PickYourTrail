//PRE-REQUISITES
const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

//--------------------------------------------------------------------------------------------------
//INITIALIZATION

dotenv.config({ path: './config.env' });//to load the config.env file and set the environment variables


//CONNECT WITH DATABASE
const DB = process.env.DATABASE_URL.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB)
    .then((conn) => {
        // console.log("DB connected to:", conn.connection);
        console.log("DB connection successful");
    })
    .catch(err => console.error("DB connection failed:", err));











//--------------------------------------------------------------------------------------------------
//SERVER
// console.log(app.get("env"));
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    console.log(`we are currently in ${process.env.NODE_ENV} mode`);

});
// git add config.env controllers public routes server.js app.js package.json