# AI Study Weakness Tracker 🎯

A cutting-edge, MERN-stack web application engineered to deeply analyze student quiz performance, mathematically detect critical weak topics, and dynamically construct personalized AI-driven study recommendations.

## 🚀 Features

- **Secure User Authentication:** JWT-based logging, signup, and protected dashboard routing.
- **Dynamic Quiz System:** Generate customized technical assessments filtered natively by difficulty, topic, and subject bounds.
- **Topic-wise Weakness Detection:** Aggregates explicit subject metadata instantly post-quiz to automatically scale precision tracking arrays correctly charting strengths (>75%), moderates (50-75%), and weaknesses (<50%).
- **Topographic Dashboard Analytics:** Beautiful charting arrays rendering explicit sub-topic trajectories alongside holistic assessment history benchmarks.
- **Premium Question Navigation Panel:** Engage with competitive-exam style grid mappings (GATE, NPTEL format) containing explicit state boundaries (Answered, Skipped, Not Visited, Marked for Review). 
- **Timer & Auto Submit:** Native evaluation chronometers scaling optimally per-question limits and resolving timeouts via remote API secure handlers.
- **Generative AI Study Plan:** Integrates historical metric algorithms querying specifically sub-par topics to dynamically author highly formatted, targeted time-mapped curriculums!

## 🛠️ Tech Stack

- **MongoDB** - Document Database Schemas & Aggregation Pipelines
- **Express.js** - Backend Routing & Controllers
- **React.js** - Frontend interfaces (Recharts, Lucide-React, CSS Grids)
- **Node.js** - Runtime Execution

## 🔧 Installation Steps

### 1. Clone the repository
```bash
git clone https://github.com/prasadsalunkhe1409-glitch/ai-study-weakness-tracker.git
cd ai-study-weakness-tracker
```

### 2. Install Dependencies
Open two distinct terminal environments.

**Backend (`/backend`)**
```bash
cd backend
npm install
```

**Frontend (`/frontend`)**
```bash
cd frontend
npm install
```

### 3. Environment Configurations
Create a `.env` in the `/backend` directory securely mapping your variables:
```env
PORT=5000
MONGO_URI=your_mongodb_cluster_string
JWT_SECRET=your_jwt_secret_token
```

### 4. Run the Application
**Start Backend Engine:**
```bash
cd backend
npm run dev
# OR: node index.js
```

**Start Frontend Application:**
```bash
cd frontend
npm run dev
```
Navigate to `http://localhost:5173/` in your local browser to interact!

## 📸 Screenshots

*(Replace the placeholder strings below with image paths showcasing your live frontend UI)*

| **Analytics Dashboard** | **Dynamic Quiz Architecture** |
|:---:|:---:|
| `[Add Dashboard Image Here]` | `[Add Assessment Generator Image Here]` |

| **AI Study Blueprint** | **Competitive Navigation Palette** |
|:---:|:---:|
| `[Add Study Plan Image Here]` | `[Add Palette UI Image Here]` |

## 💡 Future Improvements

- OAuth / Google Native integrations framework routing.
- Dynamic global leaderboard mappings ranking peers globally via scoring aggregates.
- Open LLM networking binding explicit GPT APIs natively onto the Study Assistant endpoints.
- Administrator Dashboard to securely configure software questions dynamically inside the UI arrays.

---

*Developed meticulously with MERN*
