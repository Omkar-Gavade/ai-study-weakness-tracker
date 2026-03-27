const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));
app.use('/api/practice', require('./routes/practiceRoutes'));
app.use('/api/recommendation', require('./routes/recommendationRoutes'));
app.use('/api/performance', require('./routes/performanceRoutes'));
app.use('/api/user', require('./routes/userStatsRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Error: ${err.message}`);
    process.exit(1);
});