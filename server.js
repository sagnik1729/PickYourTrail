//PRE-REQUISITES
const app = require("./app");
const dotenv = require("dotenv");


//--------------------------------------------------------------------------------------------------
//INITIALIZATION

dotenv.config({ path: './config.env' });//to load the config.env file and set the environment variables













//--------------------------------------------------------------------------------------------------
//SERVER
// console.log(app.get("env"));
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    console.log(`we are currently in ${process.env.NODE_ENV} mode`);

});

