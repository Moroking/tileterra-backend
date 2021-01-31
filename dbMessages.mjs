import mongoose from 'mongoose';

const questSchema = mongoose.Schema({
    quest: String,
    reward: String,
    type: String,
    amount: String,
});

export default mongoose.model('messagecontents',questSchema);