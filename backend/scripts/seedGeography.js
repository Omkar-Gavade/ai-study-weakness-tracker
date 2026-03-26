const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Question = require('../models/Question');
require('dotenv').config();

const generateHash = (text) => {
  return crypto.createHash('md5').update(text).digest('hex');
};

const seedGeography = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-study-tracker';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB...');

    const files = [
      'geo_physical_1.json',
      'geo_physical_2.json',
      'geo_economic_1.json',
      'geo_economic_2.json',
      'geo_maharashtra_1.json',
      'geo_maharashtra_2.json',
      'geo_world_1.json',
      'geo_world_2.json'
    ];

    // Clear existing (potentially wrong) Geography questions
    await Question.deleteMany({ subject: 'भूगोल' });
    console.log('Cleared old Geography questions.');

    let allQuestions = [];

    for (const file of files) {
      const filePath = path.join(__dirname, '../tmp', file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      const mappedData = data.map(q => ({
        text: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        subject: 'भूगोल',
        topic: q.topic,
        difficulty: q.difficulty.toLowerCase(),
        section: 'स्पर्धा परीक्षा तयारी',
        subsection: q.topic, // mapped to specific topic name (e.g. "भौतिक भूगोल")
        testNumber: q.testNumber.toString(),
        explanation: q.explanation,
        questionHash: generateHash(q.questionText)
      }));

      allQuestions = allQuestions.concat(mappedData);
    }

    console.log(`Total questions loaded: ${allQuestions.length}`);

    await Question.insertMany(allQuestions);
    console.log(`Successfully seeded ${allQuestions.length} Geography questions with corrected mapping!`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding Geography:', err);
    process.exit(1);
  }
};

seedGeography();
