import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Work from './models/Work';
import Chapter from './models/Chapter';

dotenv.config();

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in the environment variables.');
    }
    await mongoose.connect(mongoUri, { dbName: 'novel_website' });
    console.log('MongoDB connected for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Work.deleteMany({});
    await Chapter.deleteMany({});

    console.log('Cleared existing data.');

    // Create sample user
    const sampleUser = new User({
      username: 'testuser',
      password: 'password123', // In a real app, this should be hashed
    });
    await sampleUser.save();
    console.log('Created sample user.');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      password: 'adminpassword',
      role: 'admin',
    });
    await adminUser.save();
    console.log('Created admin user.');

    // Create sample novel
    const novel = new Work({
      title: 'The Fall of the Monolith',
      type: 'novel',
      description: 'A sci-fi epic about the last of humanity facing a cosmic threat.',
      author: sampleUser._id,
      coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
      moderationStatus: 'published',
      isPublished: true, // Mark novel as published
    });
    await novel.save();
    console.log('Created sample novel.');

    // Create chapters for the novel
    const novelChapter1 = new Chapter({
      work: novel._id,
      chapterNumber: 1,
      title: 'The Warning',
      content: `The stars were dying. One by one, they flickered out of existence, leaving gaping holes of blackness in the velvet sky. Onboard the starship 'Odyssey', Captain Eva Rostova watched the celestial carnage with a heavy heart. The Monolith was coming. It was an entity of pure darkness, consuming everything in its path. And it was heading for Earth.`,
    });
    await novelChapter1.save();

    const novelChapter2 = new Chapter({
      work: novel._id,
      chapterNumber: 2,
      title: 'First Contact',
      content: `A transmission pierced the silence of the bridge. It was not a language, but a feeling - a wave of pure dread that washed over the crew. The Monolith was communicating. It showed them visions of fallen civilizations, of galaxies turned to dust. It was not a conqueror. It was a force of nature, and humanity was in its way.`,
    });
    await novelChapter2.save();
    console.log('Created novel chapters.');

    // Create sample manga
    const manga = new Work({
      title: 'Blade of the Undying',
      type: 'manga',
      description: 'In a feudal world, a cursed samurai seeks a way to break his immortality.',
      author: sampleUser._id,
      coverImageUrl: 'https://images.unsplash.com/photo-1599408162165-401246c5c740?q=80&w=1000&auto=format&fit=crop',
      moderationStatus: 'published',
      isPublished: true, // Mark manga as published
    });
    await manga.save();
    console.log('Created sample manga.');

    // Create more diverse works
    const novel2 = new Work({
      title: 'Neon Shadows',
      type: 'novel',
      description: 'A cyberpunk noir story set in the rain-slicked streets of New Kyoto.',
      author: sampleUser._id,
      coverImageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1000&auto=format&fit=crop',
      genres: ['Cyberpunk', 'Noir', 'Mystery'],
      moderationStatus: 'published',
      isPublished: true,
    });
    await novel2.save();

    const comic1 = new Work({
      title: 'The Last Guardian',
      type: 'comic',
      description: 'The last survivor of an ancient order protects a world that has forgotten magic.',
      author: sampleUser._id,
      coverImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop',
      genres: ['Fantasy', 'Action', 'Adventure'],
      moderationStatus: 'published',
      isPublished: true,
    });
    await comic1.save();

    const manga2 = new Work({
      title: 'Slice of Eternity',
      type: 'manga',
      description: 'A heartwarming story about a cafe that serves memories to the departed.',
      author: sampleUser._id,
      coverImageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop',
      genres: ['Slice of Life', 'Supernatural', 'Drama'],
      moderationStatus: 'published',
      isPublished: true,
    });
    await manga2.save();
    console.log('Created additional sample works.');

    // Create chapters for the manga
    const mangaChapter1 = new Chapter({
      work: manga._id,
      chapterNumber: 1,
      title: 'The Curse of a Thousand Lives',
      // For manga, content would typically be an array of image URLs,
      // but we'll use text for this seed script.
      content: 'Page 1: A lone samurai, Kenshin, stands on a cliff, overlooking a war-torn valley. His eyes are weary.\\n\\nPage 2: Flashback to a bloody battle. Kenshin is struck down, only to rise again, his wounds healing instantly.\\n\\nPage 3: A sorceress cackles, \\\'You will never know the peace of death, Kenshin!\\\'',
    });
    await mangaChapter1.save();

    const mangaChapter2 = new Chapter({
      work: manga._id,
      chapterNumber: 2,
      title: 'The Whispering Blade',
      content: "Page 1: Kenshin enters a quiet village. The villagers eye him with suspicion and fear.\\n\\nPage 2: He finds an old blacksmith who recognizes the cursed mark on Kenshin's hand.\\n\\nPage 3: The blacksmith tells him of a legendary sword, the Soul Reaver, that is said to be able to kill even the undying.",
    });
    await mangaChapter2.save();
    console.log('Created manga chapters.');

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDB();
