'use strict'; 

const mongoose = require('mongoose'),
    mongoose_timestamps = require('mongoose-timestamp');

const schema = mongoose.Schema; 

let Class = new schema ({
    course: {type: String, default: '', required: true},
    code: {type: String, default: '', required: true},
    room: { type: String, default: '', required: true},
    teacher: {type: schema.Types.ObjectId, ref: 'userAccounts'},
    students: [{type: schema.Types.ObjectId, ref: 'userAccounts'}]
}); 

Class.plugin(mongoose_timestamps);

module.exports = mongoose.model('Class', Class);



























