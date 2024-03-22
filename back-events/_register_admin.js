// TODO - Delete this file or consider moving it to a different location
import mongoose, { Types } from "mongoose";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

mongoose.set('strictQuery', true);
mongoose.connect(DB_CONNECTION_STRING);

const UserSchema = new mongoose.Schema({
  _id: { type: Types.ObjectId, required: false, auto: true }, // Will be auto-generated
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: Number, required: true },
});



const UserModel = mongoose.model("users", UserSchema);

// TODO - move to db.ts? Do we want it?
export const registerAdmin = async () => {
  try {
    
    const hashedPassword = await bcrypt.hash("admin", 10);
    const user = new UserModel({ username: "admin", password: hashedPassword, role: 0 });
    await user.save();
    return true;
  }
  catch (err) {
    console.error(err);
    // TODO - proper handling?
    return false;
  }
}


registerAdmin();