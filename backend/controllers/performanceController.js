/**
 * performanceController.js
 * Rule-based AI performance analysis for quiz results.
 * POST /api/performance/analyze
 */
const Question = require('../models/Question');

// @desc  Analyze user quiz performance (rule-based AI)
// @route POST /api/performance/analyze
// @access Private
const analyzePerformance = async (req, res) => {
  try {
    const { quizId, answers, subjectName, topicName } = req.body;
    // answers = [{ questionId, selectedOption }]

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array required.' });
    }

    // Fetch question details from DB
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    const total     = questions.length;
    const attempted = answers.filter(a => a.selectedOption !== null && a.selectedOption !== undefined).length;
    const correct   = questions.filter(q => {
      const ans = answers.find(a => a.questionId.toString() === q._id.toString());
      return ans && ans.selectedOption === q.correctAnswer;
    }).length;
    const wrong     = attempted - correct;
    const overall   = total   > 0 ? Math.round((correct / total)    * 100) : 0;
    const accuracy  = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    // Group by topic/subject
    const topicMap = {};
    questions.forEach(q => {
      const key = q.topic || q.subject || subjectName || topicName || 'सामान्य';
      if (!topicMap[key]) topicMap[key] = { total: 0, correct: 0, wrong: 0 };
      topicMap[key].total++;
      const ans = answers.find(a => a.questionId.toString() === q._id.toString());
      if (ans && ans.selectedOption === q.correctAnswer) topicMap[key].correct++;
      else if (ans && ans.selectedOption) topicMap[key].wrong++;
    });

    const topicStats = Object.entries(topicMap).map(([name, s]) => ({
      name,
      ...s,
      pct: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    }));

    const weak   = topicStats.filter(t => t.pct < 50);
    const medium = topicStats.filter(t => t.pct >= 50 && t.pct < 75);
    const strong = topicStats.filter(t => t.pct >= 75);

    // Generate Marathi suggestions
    const suggestions = [];
    if (weak.length > 0) {
      const names = weak.map(t => t.name).join(' आणि ');
      suggestions.push({ urgency: 'high',   text: `📖 पुढील ३ दिवस ${names} विषयाचा सखोल अभ्यास करा.` });
      suggestions.push({ urgency: 'high',   text: `✍️ ${names} वरील मागील वर्षांचे प्रश्न सोडवा.` });
    }
    if (medium.length > 0) {
      const names = medium.map(t => t.name).join(' आणि ');
      suggestions.push({ urgency: 'medium', text: `📝 ${names} मध्ये आणखी सराव केल्यास उत्तम गुण मिळतील.` });
    }
    if (strong.length > 0) {
      const names = strong.map(t => t.name).join(' आणि ');
      suggestions.push({ urgency: 'low',    text: `✅ ${names} मध्ये तुम्ही चांगले आहात — फक्त देखभाल सराव ठेवा.` });
    }
    if (overall < 40)
      suggestions.push({ urgency: 'high',   text: '🔁 दररोज किमान ३० प्रश्न सोडवण्याची सवय लावा.' });
    else if (overall < 60)
      suggestions.push({ urgency: 'medium', text: '⏱️ वेळेचे नियोजन करा — प्रत्येक प्रश्नासाठी जास्तीत जास्त ६० सेकंद.' });
    else
      suggestions.push({ urgency: 'low',    text: '🏆 उत्कृष्ट सराव! आता मॉक टेस्ट द्या आणि कमकुवत भाग ओळखा.' });

    // Verdict message
    const subLabel = subjectName || topicName || 'या विषयात';
    let verdict = '';
    if (weak.length > 0 && strong.length === 0)
      verdict = `⚠️ तुम्ही ${weak.map(t=>t.name).join(' आणि ')} मध्ये कमकुवत आहात. अधिक सराव आवश्यक आहे.`;
    else if (strong.length > 0 && weak.length === 0)
      verdict = `🌟 तुम्ही ${strong.map(t=>t.name).join(' आणि ')} मध्ये चांगले आहात!`;
    else if (weak.length > 0)
      verdict = `📊 तुम्ही ${strong.map(t=>t.name).join(', ')} मध्ये चांगले, पण ${weak.map(t=>t.name).join(' आणि ')} मध्ये सुधारणा आवश्यक.`;
    else
      verdict = `👍 ${subLabel} मध्ये तुमची कामगिरी सरासरी आहे. नियमित सरावाने सुधारणा होईल.`;

    res.json({
      summary: { total, attempted, correct, wrong, overall, accuracy },
      topicStats,
      weak,
      medium,
      strong,
      suggestions,
      verdict,
    });
  } catch (err) {
    console.error('analyzePerformance error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { analyzePerformance };
