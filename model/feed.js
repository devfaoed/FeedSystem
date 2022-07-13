var mongoose = require('mongoose');

feedSchema = new mongoose.Schema({
    name: String,
    message : String,
    date:{
        type: Date,
        default: Date.now
    }
})

Message = mongoose.model('Message', feedSchema)

module.exports = Message