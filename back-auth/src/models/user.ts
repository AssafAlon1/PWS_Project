
import * as mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: {type: Number, required: false, default: 3},
}, { id: false });

export default mongoose.model('auths', userSchema);
