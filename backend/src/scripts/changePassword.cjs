const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config();

const getArg = (name) => {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
};

const run = async () => {
  const usernameArg = getArg('--username');
  const password = getArg('--password');
  const username = usernameArg ? usernameArg.trim() : null;

  if (!username || !password) {
    console.error('Usage: node src/scripts/changePassword.cjs --username <name> --password <new_password>');
    process.exit(1);
  }

  if (password.length < 8 || password.length > 128) {
    console.error('Password must be between 8 and 128 characters.');
    process.exit(1);
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }

  const connectOptions = {};
  if (process.env.MONGO_DB_NAME) {
    connectOptions.dbName = process.env.MONGO_DB_NAME;
  }
  await mongoose.connect(uri, connectOptions);

  const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
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
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const user = await User.findOne({ username });
  if (!user) {
    console.error(`User "${username}" not found.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.password = password;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();
  console.log(`Password updated for "${username}". Account lock state has been reset.`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
