const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-study-tracker';

const verifyData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    const count = await Question.countDocuments({ subject: 'इतिहास' });
    console.log(`Total History Questions: ${count}`);

    const topics = await Question.distinct('topic', { subject: 'इतिहास' });
    console.log(`Topics found: ${topics.join(', ')}`);

    for (const topic of topics) {
        const tCount = await Question.countDocuments({ topic, subject: 'इतिहास' });
        const easy = await Question.countDocuments({ topic, subject: 'इतिहास', difficulty: 'easy' });
        const medium = await Question.countDocuments({ topic, subject: 'इतिहास', difficulty: 'medium' });
        const hard = await Question.countDocuments({ topic, subject: 'इतिहास', difficulty: 'hard' });
        
        console.log(`Topic: ${topic} | Total: ${tCount} | E: ${easy}, M: ${medium}, H: ${hard}`);
    }

    process.exit();
  } catch (error) {
    console.error(`Error during verification: ${error.message}`);
    process.exit(1);
  }
};

verifyData();
