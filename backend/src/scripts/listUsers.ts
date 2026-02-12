import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';

dotenv.config();

const run = async () => {
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

  const users = await User.find()
    .select('username role')
    .sort({ role: -1, username: 1 })
    .lean();

  if (users.length === 0) {
    console.log('No users found.');
    await mongoose.disconnect();
    return;
  }

  const admins = users.filter((user) => user.role === 'admin');
  const regularUsers = users.filter((user) => user.role === 'user');

  console.log(`Total: ${users.length}`);
  console.log(`Admins: ${admins.length}`);
  console.log(`Users: ${regularUsers.length}`);
  console.log('');
  console.table(
    users.map((user) => ({
      username: user.username,
      role: user.role,
    }))
  );

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
