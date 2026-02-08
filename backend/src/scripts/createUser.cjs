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
  const username = getArg('--username');
  const password = getArg('--password');

  if (!username || !password) {
    console.error('Usage: node src/scripts/createUser.cjs --username <name> --password <pass>');
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

  const existing = await User.findOne({ username });
  if (existing) {
    existing.password = password;
    existing.role = 'user';
    await existing.save();
    console.log(`Updated existing user "${username}" to user.`);
  } else {
    const user = new User({ username, password, role: 'user' });
    await user.save();
    console.log(`Created user "${username}".`);
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
