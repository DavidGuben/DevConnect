// Require mongoose dependency
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Schema for user Post(s)
const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,  // Pull users unique id
        ref: 'users'  // references the 'users' db collection
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String,
    },
    avatar: {
        type: String
    },
    // Likes will be stored by unique ID
    likes: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    // Comments will be stored by unique ID
    comments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true
            },
            name: {
                type: String,
            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Post = mongoose.model('post', PostSchema);