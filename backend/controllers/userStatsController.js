/**
 * userStatsController.js
 * GET /api/user/stats  → summary + 3 chart datasets
 */
const QuizAttempt = require('../models/QuizAttempt');

const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Populate quiz.section for subject-wise breakdown
    const attempts = await QuizAttempt
      .find({ user: userId })
      .sort({ createdAt: 1 })
      .populate('quiz', 'section')
      .select('score answers createdAt quiz');

    /* ── Summary stats ─────────────────────────────────────────────────────── */
    const totalTests = attempts.length;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayTests = attempts.filter(a => new Date(a.createdAt) >= todayStart).length;
    const scores = attempts.map(a => a.score);
    const bestScore    = scores.length ? Math.max(...scores) : 0;
    const averageScore = scores.length
      ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;

    /* ── Line chart: score progress over time ───────────────────────────────── */
    const progressData = attempts.slice(-20).map((a, i) => ({
      name: `#${i + 1}`,
      date: new Date(a.createdAt).toLocaleDateString('mr-IN', { month: 'short', day: 'numeric' }),
      score: a.score,
    }));

    /* ── Bar chart: subject-wise average score ──────────────────────────────── */
    const subjectMap = {};
    attempts.forEach(a => {
      const subject = a.quiz?.section || 'इतर';
      if (!subjectMap[subject]) subjectMap[subject] = { total: 0, sum: 0 };
      subjectMap[subject].total++;
      subjectMap[subject].sum += a.score;
    });
    const subjectData = Object.entries(subjectMap).map(([name, s]) => ({
      name,
      score: Math.round(s.sum / s.total),
    }));

    /* ── Pie chart: correct / wrong / skipped across all attempts ───────────── */
    let correct = 0, wrong = 0, skipped = 0;
    attempts.forEach(a => {
      (a.answers || []).forEach(ans => {
        if (!ans.selectedOption) skipped++;
        else if (ans.isCorrect)  correct++;
        else                     wrong++;
      });
    });
    // Fallback when no answer details exist yet
    if (correct + wrong + skipped === 0 && scores.length) {
      correct = bestScore; wrong = 100 - bestScore; skipped = 0;
    }
    const pieData = [
      { name: 'बरोबर',    value: correct,  fill: '#22c55e' },
      { name: 'चुकीचे',   value: wrong,    fill: '#ef4444' },
      { name: 'सोडलेले',  value: skipped,  fill: '#6b7280' },
    ];

    /* ── Weak topics: accuracy < 50% ────────────────────────────────────────── */
    const weakTopics = subjectData.filter(s => s.score < 50).map(s => s.name);

    res.json({ totalTests, todayTests, bestScore, averageScore,
               progressData, subjectData, pieData, weakTopics });
  } catch (err) {
    console.error('getUserStats error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUserStats };
