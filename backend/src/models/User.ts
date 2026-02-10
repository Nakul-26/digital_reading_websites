import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 128,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const bcryptRounds = Number.parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  const saltRounds = Number.isInteger(bcryptRounds) && bcryptRounds >= 10 ? bcryptRounds : 12;
  const salt = await bcrypt.genSalt(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
});

export interface IUser extends Document {
  id: string;
  username: string;
  password?: string;
  role: 'user' | 'admin';
}

export default mongoose.model<IUser>('User', UserSchema);
