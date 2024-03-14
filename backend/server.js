const express = require('express');
const mongoose = require('mongoose');

const routes = require('./routes/route')
const cors = require('cors');
const cookieParser = require('cookie-parser');


const app = express()

app.use(cors({
    credentials : true,
    origin:[ 'http://localhost:4200']
}))

app.use(cookieParser())
app.use(express.json())
app.use("/api",routes)

mongoose.connect("mongodb://localhost:27017/pfe",{
    useNewUrlParser :true,
   

})
.then(() => {
    console.log("connected to db ")
    app.listen(2000,() => {
        console.log("app is listening on port 2000")

    })
})