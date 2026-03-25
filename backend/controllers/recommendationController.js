const generateRecommendation = async (req, res) => {
    try {
        const { weakTopics, studyHours } = req.body;
        
        if (!weakTopics || weakTopics.length === 0) {
            return res.json({ plan: "### Excellent Progress!\n\nYou currently have no flagged weak topics.\n\n- **Day 1-3** → Keep practicing mixed difficulty quizzes to maintain your comprehensive proficiency.\n- **Focus** → Aim for a perfect 100% precision across all segments." });
        }

        // Prioritize structured arrays parsing exactly metrics under 50% implicitly
        const sortedTopics = [...weakTopics].sort((a, b) => a.accuracy - b.accuracy);
        const hours = studyHours || 2; 

        // Generate a 3-5 day study plan dynamically mapping parameters
        const totalDays = Math.min(5, Math.max(3, sortedTopics.length));
        
        let plan = `### Personalized ${totalDays}-Day Study Plan (${hours} Hours/Day)\n\nTargeting your weakest areas dynamically to maximize exam retention.\n\n`;

        for (let i = 1; i <= totalDays; i++) {
            // Assign a primary topic per day, rotating sequentially if days > topics
            const t = sortedTopics[(i - 1) % sortedTopics.length];
            
            plan += `**Day ${i} → ${t.topic}**\n`;
            if (i === 1) {
                plan += `- **Practice**: Dive deep into Core Concepts & Fundamentals for ${t.topic} (Current Accuracy: ${t.accuracy}%).\n`;
            } else if (i === totalDays) {
                plan += `- **Revision**: Comprehensive mock assessment explicitly on ${t.topic} referencing previous failure vectors.\n`;
            } else {
                plan += `- **Practice**: Intermediate Problem Solving & Algorithm Tracing for ${t.topic}.\n`;
            }
            plan += `- **Time Allocation**: ${hours} hours structured focus block.\n\n`;
        }

        plan += `### 💡 Improvement Suggestions\n`;
        plan += `- **Focus Area**: Prioritize ${sortedTopics[0].topic} immediately as it registers your lowest topography accuracy globally (${sortedTopics[0].accuracy}%).\n`;
        plan += `- **Methodology**: Do not memorize answers blindly. Trace structural algorithmic implementations natively before attempting new assessments.\n`;
        plan += `- **Consistency**: Adhere rigorously to the ${hours}-hour continuous daily execution blocks.\n`;

        // Simulate AI Network Delay gracefully
        setTimeout(() => {
            res.status(200).json({ plan });
        }, 1500);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateRecommendation };
