const fs = require('fs');
const path = require('path');

const tmpDir = 'c:\\Users\\LOQ\\Desktop\\Old laptop\\Mummy\\Project\\AI Based Study Weakness Tracker\\backend\\tmp';
const files = [
  'ancient_test_1.json', 'ancient_test_2.json',
  'medieval_test_1.json', 'medieval_test_2.json',
  'modern_test_1.json', 'modern_test_2.json',
  'maharashtra_test_1.json', 'maharashtra_test_2.json'
];

let allQuestions = [];

files.forEach(file => {
  const filePath = path.join(tmpDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  allQuestions = allQuestions.concat(data);
});

const outputPath = path.join(tmpDir, 'history_questions.json');
fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2), 'utf8');

console.log(`Successfully merged ${allQuestions.length} questions into ${outputPath}`);
