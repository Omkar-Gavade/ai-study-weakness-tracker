const mongoose = require('mongoose');
const dotenv = require('dotenv');
const QuizAttempt = require('./models/QuizAttempt');

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-study-tracker');
        console.log('Connected to MongoDB');

        const totalAttempts = await QuizAttempt.countDocuments();
        console.log(`Total quiz attempts in DB: ${totalAttempts}`);

        if (totalAttempts > 0) {
            const lastAttempt = await QuizAttempt.findOne().sort({ createdAt: -1 }).populate('user', 'name email');
            console.log('Last attempt details:');
            console.log(`User: ${lastAttempt.user?.name} (${lastAttempt.user?.email})`);
            console.log(`Score: ${lastAttempt.score}`);
            console.log(`Date: ${lastAttempt.createdAt}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
