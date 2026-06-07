import mongoose from 'mongoose';

export const dbConnect = () => {
  mongoose
    .connect(String(process.env.MONGO_URI))
    .then(() => console.log('MongoDB connected'))
    .catch(error => console.error(error));
};
