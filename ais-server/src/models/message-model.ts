import mongoose from "mongoose";

const MessageMongoSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        index: true
    }

}, {
    timestamps: true,
})

MessageMongoSchema.index({ channelId: 1, createdAt: -1 })

export const MessageModel = mongoose.model('Message', MessageMongoSchema)