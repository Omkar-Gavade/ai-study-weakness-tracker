const mongoose = require('mongoose');

// MongoDB Connection
const MONGO_URI = 'mongodb://localhost:27017/ai-study-tracker';

// Question Schema
const questionSchema = new mongoose.Schema({
  text: String,
  subject: String,
  subsection: String,
  section: String,
  testNumber: Number
});

const Question = mongoose.model('Question', questionSchema);

async function verify() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for verification');

    const stats = await Question.aggregate([
      { $match: { subject: 'चालू घडामोडी', section: 'स्पर्धा परीक्षा तयारी' } },
      { $group: { _id: '$subsection', count: { $sum: 1 } } }
    ]);

    console.log('Current Affairs Subsection Stats:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} questions`);
    });

    const totalCount = await Question.countDocuments({ subject: 'चालू घडामोडी', section: 'स्पर्धा परीक्षा तयारी' });
    console.log(`Total questions in 'चालू घडामोडी': ${totalCount}`);

    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
}

verify();
