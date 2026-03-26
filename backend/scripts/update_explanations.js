const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('../models/Question');

dotenv.config();

const updateQuestions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-study-tracker');
        console.log('Connected to MongoDB');

        const questions = await Question.find({ explanation: { $exists: false } });
        console.log(`Found ${questions.length} questions without explanations.`);

        for (const q of questions) {
            let explanation = '';
            const section = q.section || '';
            const sub = q.subsection || '';

            if (section.includes('इतिहास') || sub.includes('History')) {
                explanation = `हा प्रश्न महाराष्ट्राच्या इतिहासातील महत्त्वाच्या घडामोडींवर आधारित आहे. '${q.correctAnswer}' हे उत्तर ऐतिहासिक तथ्यांनुसार अचूक आहे.`;
            } else if (section.includes('भूगोल') || sub.includes('Geography')) {
                explanation = `भौगोलिक रचनेनुसार '${q.correctAnswer}' हे विधान योग्य आहे. हे महाराष्ट्राच्या प्राकृतिक किंवा राजकीय भूगोलाशी संबंधित आहे.`;
            } else if (section.includes('राज्यशास्त्र') || sub.includes('Polity')) {
                explanation = `भारतीय राज्यघटनेच्या आणि पंचायत राज व्यवस्थेच्या नियमांनुसार '${q.correctAnswer}' हा पर्याय बरोबर आहे.`;
            } else {
                explanation = `दिलेल्या पर्यायांपैकी '${q.correctAnswer}' हा पर्याय विषयाच्या सखोल अभ्यासावरून सर्वात तर्कसंगत आणि अचूक ठरतो.`;
            }
            
            q.explanation = explanation;
            await q.save();
        }

        console.log('Answer explanations updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Update failed:', err);
        process.exit(1);
    }
};

updateQuestions();
