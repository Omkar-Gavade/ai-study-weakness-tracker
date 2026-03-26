const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB Connection
const MONGO_URI = 'mongodb://localhost:27017/ai-study-tracker';

// Question Schema (Matching the existing model)
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  section: { type: String, required: true },
  subsection: { type: String, required: true },
  testNumber: { type: Number, required: true },
  questionHash: { type: String, unique: true },
  explanation: { type: String }
});

const Question = mongoose.model('Question', questionSchema);

const seedFiles = [
  { file: 'cur_national_1.json', subsection: 'राष्ट्रीय घटना' },
  { file: 'cur_national_2.json', subsection: 'राष्ट्रीय घटना' },
  { file: 'cur_state_1.json', subsection: 'राज्य घडामोडी' },
  { file: 'cur_state_2.json', subsection: 'राज्य घडामोडी' },
  { file: 'cur_international_1.json', subsection: 'आंतरराष्ट्रीय' },
  { file: 'cur_international_2.json', subsection: 'आंतरराष्ट्रीय' },
  { file: 'cur_awards_1.json', subsection: 'पुरस्कार व नियुक्त्या' },
  { file: 'cur_awards_2.json', subsection: 'पुरस्कार व नियुक्त्या' }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing Current Affairs questions in this section
    const deleteResult = await Question.deleteMany({ 
        subject: 'चालू घडामोडी',
        section: 'स्पर्धा परीक्षा तयारी' 
    });
    console.log(`Cleared ${deleteResult.deletedCount} existing Current Affairs questions.`);

    let totalSeeded = 0;

    for (const entry of seedFiles) {
      const filePath = path.join(__dirname, '..', 'tmp', entry.file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const questionsToInsert = data.map(q => ({
        text: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        section: 'स्पर्धा परीक्षा तयारी',
        subsection: entry.subsection,
        testNumber: q.testNumber,
        explanation: q.explanation,
        questionHash: Buffer.from(`${q.questionText}-${entry.subsection}-${q.testNumber}`).toString('base64')
      }));

      await Question.insertMany(questionsToInsert);
      console.log(`Seeded ${questionsToInsert.length} questions from ${entry.file}`);
      totalSeeded += questionsToInsert.length;
    }

    console.log(`Successfully seeded ${totalSeeded} questions in total.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
