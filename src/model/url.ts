import mongoose, { Schema } from 'mongoose';
const urlSchema = new Schema({
    full: {
        type: String,
        required: true
    },
    short: {
        type: String,
        required: true
    },
    clicks: {
        type: Number,
        required: true,
        default: 0
    }
});
export const Document = mongoose.model('shorturl', urlSchema);
