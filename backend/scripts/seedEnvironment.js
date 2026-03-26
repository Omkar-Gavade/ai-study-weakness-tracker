const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Question = require('../models/Question');

const mongoURI = 'mongodb://localhost:27017/ai-study-tracker';

const files = [
  'env_ecology_1.json', 'env_ecology_2.json',
  'env_biodiversity_1.json', 'env_biodiversity_2.json',
  'env_climate_1.json', 'env_climate_2.json',
  'env_pollution_1.json', 'env_pollution_2.json'
];

async function seedEnvironment() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB...');

    for (const file of files) {
      const filePath = path.join(__dirname, '../tmp', file);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${file}`);
        continue;
      }

      const rawData = fs.readFileSync(filePath, 'utf8');
      const questions = JSON.parse(rawData);

      const mappedQuestions = questions.map(q => {
        const questionHash = crypto.createHash('md5').update(q.questionText).digest('hex');
        return {
          text: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          subject: 'पर्यावरण',
          topic: q.topic,
          difficulty: q.difficulty.toLowerCase(),
          section: 'स्पर्धा परीक्षा तयारी',
          subsection: q.topic, // Marathi topic name
          explanation: q.explanation,
          testNumber: q.testNumber.toString(),
          questionHash: questionHash
        };
      });

      for (const q of mappedQuestions) {
        await Question.findOneAndUpdate(
          { questionHash: q.questionHash },
          { $set: q },
          { upsert: true, new: true }
        );
      }
      console.log(`Seeded ${file} - ${questions.length} questions.`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding environment data:', err);
    process.exit(1);
  }
}

seedEnvironment();
