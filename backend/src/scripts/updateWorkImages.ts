import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Work from '../models/Work';

dotenv.config();

const images = {
  'The Fall of the Monolith': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
  'Blade of the Undying': 'https://images.unsplash.com/photo-1599408162165-401246c5c740?q=80&w=1000&auto=format&fit=crop',
  'default_novel': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1000&auto=format&fit=crop',
  'default_manga': 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1000&auto=format&fit=crop',
  'default_comic': 'https://images.unsplash.com/photo-1588497859490-85d1c17db96d?q=80&w=1000&auto=format&fit=crop'
};

const updateImages = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in the environment variables.');
    }
    await mongoose.connect(mongoUri, { dbName: 'novel_website' });
    console.log('MongoDB connected for updating images');

    const works = await Work.find({});
    console.log(`Found ${works.length} works to check.`);

    for (const work of works) {
      let newImageUrl = '';
      
      if (images[work.title as keyof typeof images]) {
        newImageUrl = images[work.title as keyof typeof images];
      } else {
        switch (work.type) {
          case 'novel':
            newImageUrl = images.default_novel;
            break;
          case 'manga':
            newImageUrl = images.default_manga;
            break;
          case 'comic':
            newImageUrl = images.default_comic;
            break;
        }
      }

      if (newImageUrl && work.coverImageUrl !== newImageUrl) {
        work.coverImageUrl = newImageUrl;
        await work.save();
        console.log(`Updated image for: ${work.title}`);
      } else {
        console.log(`Skipping: ${work.title} (already has image or no suitable one found)`);
      }
    }

    console.log('Finished updating images!');
  } catch (err) {
    console.error('Error updating images:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

updateImages();
