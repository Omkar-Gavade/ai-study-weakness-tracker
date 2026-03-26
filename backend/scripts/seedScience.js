const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Question = require('../models/Question');

const mongoURI = 'mongodb://localhost:27017/ai-study-tracker';

const scienceFiles = [
  'sci_physics_1.json', 'sci_physics_2.json',
  'sci_chemistry_1.json', 'sci_chemistry_2.json',
  'sci_biology_1.json', 'sci_biology_2.json',
  'sci_tech_1.json', 'sci_tech_2.json'
];

async function seedScience() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    let totalSeeded = 0;

    for (const file of scienceFiles) {
      const filePath = path.join(__dirname, '../tmp', file);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${file}`);
        continue;
      }

      const rawData = fs.readFileSync(filePath, 'utf8');
      const questions = JSON.parse(rawData);

      for (const q of questions) {
        const questionHash = crypto.createHash('md5').update(q.questionText).digest('hex');
        
        const questionData = {
          text: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty.toLowerCase(),
          section: 'स्पर्धा परीक्षा तयारी',
          subsection: q.topic,
          explanation: q.explanation,
          testNumber: q.testNumber.toString(),
          questionHash: questionHash
        };

        await Question.findOneAndUpdate(
          { questionHash: questionHash },
          { $set: questionData },
          { upsert: true, new: true }
        );
        totalSeeded++;
      }
      console.log(`Seeded ${questions.length} questions from ${file}`);
    }

    console.log(`Total Science questions seeded/updated: ${totalSeeded}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Science data:', error);
    process.exit(1);
  }
}

seedScience();
