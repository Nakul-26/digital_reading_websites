import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';

dotenv.config();

const getArg = (name: string) => {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
};

const run = async () => {
  const username = getArg('--username');
  const password = getArg('--password');

  if (!username || !password) {
    console.error('Usage: tsx src/scripts/createUser.ts --username <name> --password <pass>');
    process.exit(1);
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }

  const connectOptions: mongoose.ConnectOptions = {};
  if (process.env.MONGO_DB_NAME) {
    connectOptions.dbName = process.env.MONGO_DB_NAME;
  }
  await mongoose.connect(uri, connectOptions);

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
