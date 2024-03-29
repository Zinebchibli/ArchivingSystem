const mongoose = require('mongoose')


const userSchema = new mongoose.Schema ({

    fullname : {
        type : String,
        unique:true,
        required : true
    },
    email :{
        type : String,
        unique:true,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    folder: {
        type: String,
        unique: true,
        required: true
    }
})

module.exports = mongoose.model("User", userSchema)