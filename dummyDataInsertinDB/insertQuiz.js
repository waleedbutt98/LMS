'use strict'; 

const mongoose = require('mongoose'),
    mongoose_timestamps = require('mongoose-timestamp');

const schema = mongoose.Schema; 

let quiz = new schema ({
    title: { type: String, default: 'Quiz', required: true},
    class: {type: schema.Types.ObjectId, ref: 'Class'},
    teacher: {type: schema.Types.ObjectId, required: true, ref: 'userAccounts'},
    questions: [{
        text: { type: String, default: '', required: true},
        options: [{ type: String, default: '', required: true}]
    }],
    answers: [{ type: String, default: '', required: true}],
    startDate: {type: Date, default: Date.now(), required: true},
    endDate: {type: Date, default: Date.now(), required: true},
    duration: {type: String, default: '10', required: true}
}); 

quiz.plugin(mongoose_timestamps);

const quizModal = mongoose.model('quiz', quiz);

let Class = new schema ({
    name: {type: String, default: '', required: true},
    teacher: {type: schema.Types.ObjectId, ref: 'userAccounts'},
    students: [{type: schema.Types.ObjectId, ref: 'userAccounts'}]
}); 

Class.plugin(mongoose_timestamps);

const classModal = mongoose.model('Class', Class);

let userAccount = new schema({
    email: { type: String, default: '' },
    name: { type: String, default: '', required: true },
    profileImage: { type: String, default: '' },
    userType: { type: String, required: true, enum: ['student', 'teacher', 'head', 'admin'] },
    phoneNumber: { type: String, default: '' },
    isBlocked: { type: Boolean, default: false },
    password: { type: String },
});

userAccount.plugin(mongoose_timestamps);
userAccount.index({ email: 1 }, { background: true, unique: true, name: 'IDX_EMAIL' });

userAccount.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

userAccount.pre('save', async function(next) {
    try {
        var user = this;
        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();

        // generate a salt
        let salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        console.log('Password Salt', salt);

        let hash = await bcrypt.hash(user.password, salt);
        console.log('Password Hash: ', hash);

        // override the cleartext password with the hashed one
        user.password = hash;
        next();
    } catch (err) {
        return next(err);
    }
});

const userAccountModel = mongoose.model('userAccounts', userAccount);

mongoose.connect(`mongodb+srv://dbUser:dbUserPassword@cluster0.yqhzm.mongodb.net/lms?retryWrites=true&w=majority`, async function(err, db){

    if(err) {
        console.error("Failed to Connect Mongoose");
        console.error(err);
        db.close();
        return;
    }

    const classes = await classModal.find({}).select('_id')

    const teachers = await userAccountModel.find({userType: 'teacher'}).select('_id')

    new quizModal({
        "title": "Sample Quiz" + 1,
        "class": classes[2]._id,
        "teacher": teachers[0]._id,
        "questions": [
            {
                text: "This is an example true or false question. This question is required to be answered to submit the quiz. True or False 3+3=6?", 
                options: ['true', 'false']},
            {
                text: "This is an example multiple choice question. What sound does a dog make?", 
                options: [
                    'Meow',
                    'Mooo',
                    'Oink',
                    'Hoo',
                    'Woof',
                    'Hiss',
                    'Chirp',
                    'Cluck',
                    'Ribbet',
                ]
            },
            {
                text: "This is an example of using vidoes in your questions. What Movie Series Are These Songs From? (Imperial Attack)", 
                options: [
                    'Star Wars',
                    'Pirates Of The Caribbean',
                    'Toy Story',
                    'Lion King',
                    'Shrek',
                ]
            },
            {
                text: "This is an example multiple response (checkbox) question. There are two correct answers. What is 8+8?", 
                options: [
                    '16',
                    '12',
                    '88',
                    'Sixteen',
                    'Thirteen',
                ]
            },
            {
                text: "Here is a sample captcha. Enter in the letters, numbers, and symbols here.", 
                options: []
            },
            {
                text: "Here is an example of horizontal multiple response. What sound does a cat make?", 
                options: []
            },
            {
                text: "Here is an example of a numbers question. What is 5+5?", 
                options: []
            },
        ],
        "answers": [
            'true',
            'Woof',
            'Star Wars',
            '16;Sixteen',
            'No Answer, Have to Match',
            'No Answer, Have to Match',
            'No Answer, Have to Match',
            'No Answer, Have to Match',
        ],
        "startDate": new Date(new Date().getDate()),
        "endDate": new Date(new Date().getDate() + 1),
    }).save((err) => {
        if (err) {
            console.error(err);
            return;
        } else {
            console.log({
                success: 1,
                message: 'Quiz created successfully.',
                data: {}
            });
            return;
        }
    });

});