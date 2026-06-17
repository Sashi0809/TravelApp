const mongoose= require('mongoose');

const bucketListSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },

    name:{
        type: String,
        required: true
    },

    latitude: Number,
    longitude: Number,
    visited: { type: Boolean, default: false },
    journal: { type: String, default: "" },

    createdAt:{
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
})

module.exports= mongoose.model(
    "BucketList", bucketListSchema
)