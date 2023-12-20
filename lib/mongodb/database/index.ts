import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

let cached = (global as any).mongoose || { conn: null, promise: null }

export const connectToDatabase = async () => {
    if (cached.conn) return cached.conn;

    if (!MONGO_URI) throw new Error('MONGO_URI env variable is not defined');

    cached.promise = cached.promise || mongoose.connect(MONGO_URI, {
        dbName: 'evently',
        bufferCommands: false,
    });

    cached.conn = await cached.promise;

    // Check if the database connection is successful
    if (cached.conn.readyState === 1) {
        console.log('Database connected!');
    } else {
        console.log('Database connection failed!');
    }

    return cached.conn;
}

export const checkDatabaseConnection = async () => {
    try {
        const conn = await connectToDatabase();
        const collection = conn.collection('yourCollectionName');
        const document = await collection.findOne({});

        if (document) {
            console.log('Database connection is successful!');
        } else {
            console.log('No documents found in the collection.');
        }
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};
