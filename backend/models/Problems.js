const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ProblemSchema = new Schema({
    description:{
        type: String,
        required: [true, 'Problem Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category:{
        type: String,
        enum: ['Roads', 'Garbage', 'Electricity', 'Other'],
        default: 'Other'
    },
    status:{
        type: String,
        enum: ['Reported', 'In Progress', 'Resolved'],
        default: 'Reported' // Set a default status
    },
    upvotes:{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    upvoteCount:{
        type:Number,
        default:0
    },
    reportedBy:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pinned:{
        type: Boolean,
        default: false
    },
    location:{
        type:{
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates:
        {
            type: [Number],
            required: true,
            validate:{
                validator: function(v){
                    return v.length == 2
                },
                message: 'Coordinates must be an array of [longitude, latitude].'
            }
        },
        upvotedBy: [{ // Array to store IDs of users who have voted
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User'
        }],
    }
}, { 
    timestamps: true
});

ProblemSchema.index({location: '2dsphere'});

module.exports = mongoose.model('Problem', ProblemSchema);