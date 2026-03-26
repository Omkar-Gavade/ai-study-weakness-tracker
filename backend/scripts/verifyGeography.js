const mongoose = require('mongoose');
const Question = require('../models/Question');
require('dotenv').config();

const verifyGeography = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-study-tracker';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for verification...');

    const total = await Question.countDocuments({ subject: 'भूगोल' });
    console.log(`Total Geography questions: ${total}`);

    const topics = await Question.aggregate([
      { $match: { subject: 'भूगोल' } },
      { $group: { _id: '$topic', count: { $sum: 1 } } }
    ]);
    console.log('\nTopic-wise count:');
    topics.forEach(t => console.log(`${t._id}: ${t.count}`));

    const tests = await Question.aggregate([
      { $match: { subject: 'भूगोल' } },
      { $group: { _id: { topic: '$topic', test: '$testNumber' }, count: { $sum: 1 } } },
      { $sort: { '_id.topic': 1, '_id.test': 1 } }
    ]);
    console.log('\nTest-wise count:');
    tests.forEach(t => console.log(`${t._id.topic} - Test ${t._id.test}: ${t.count}`));

    const difficulties = await Question.aggregate([
      { $match: { subject: 'भूगोल' } },
      { $group: { _id: { topic: '$topic', test: '$testNumber', diff: '$difficulty' }, count: { $sum: 1 } } },
      { $sort: { '_id.topic': 1, '_id.test': 1, '_id.diff': 1 } }
    ]);
    console.log('\nDifficulty distribution per test:');
    difficulties.forEach(d => console.log(`${d._id.topic} - T${d._id.test} - ${d._id.diff}: ${d.count}`));

    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
};

verifyGeography();
