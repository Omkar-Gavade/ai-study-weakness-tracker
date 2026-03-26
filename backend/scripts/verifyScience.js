const mongoose = require('mongoose');
const Question = require('../models/Question');

const mongoURI = 'mongodb://localhost:27017/ai-study-tracker';

async function verifyScience() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const topics = ['भौतिकशास्त्र', 'रसायनशास्त्र', 'जीवशास्त्र', 'विज्ञान व तंत्रज्ञान'];
    
    console.log('\n--- Science Dataset Verification ---');
    
    for (const topic of topics) {
      const count = await Question.countDocuments({ 
        subject: 'सामान्य विज्ञान',
        subsection: topic 
      });
      
      const test1 = await Question.countDocuments({ subject: 'सामान्य विज्ञान', subsection: topic, testNumber: 1 });
      const test2 = await Question.countDocuments({ subject: 'सामान्य विज्ञान', subsection: topic, testNumber: 2 });
      
      const easy = await Question.countDocuments({ subject: 'सामान्य विज्ञान', subsection: topic, difficulty: 'easy' });
      const medium = await Question.countDocuments({ subject: 'सामान्य विज्ञान', subsection: topic, difficulty: 'medium' });
      const hard = await Question.countDocuments({ subject: 'सामान्य विज्ञान', subsection: topic, difficulty: 'hard' });

      console.log(`Topic: ${topic}`);
      console.log(`  Total: ${count}`);
      console.log(`  Test 1: ${test1}, Test 2: ${test2}`);
      console.log(`  Easy: ${easy}, Medium: ${medium}, Hard: ${hard}`);
      console.log('-----------------------------------');
    }

    const total = await Question.countDocuments({ subject: 'सामान्य विज्ञान' });
    console.log(`Total Science questions in DB: ${total}`);

    process.exit(0);
  } catch (error) {
    console.error('Error verifying Science data:', error);
    process.exit(1);
  }
}

verifyScience();
