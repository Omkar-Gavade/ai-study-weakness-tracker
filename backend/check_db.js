const mongoose = require('mongoose');
const Question = require('./models/Question');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/ai-study-tracker');
  const historyQ = await Question.findOne({ subject: 'इतिहास' });
  console.log('History Sample:', JSON.stringify(historyQ, null, 2));
  
  const envQ = await Question.findOne({ subject: 'पर्यावरण' });
  console.log('Environment Sample:', JSON.stringify(envQ, null, 2));
  
  process.exit();
}
check();
