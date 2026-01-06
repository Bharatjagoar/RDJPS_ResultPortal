const mongoose = require("mongoose");

const classSchema = mongoose.Schema({
    class: {
        type: String,
        required: true
    },
    section: { 
        type: [String],
        default:[]
    },
    Marksverified:{
        type:Boolean,
        default:false
    }
},{timestamps:true});


module.exports = new mongoose.model("class",classSchema);