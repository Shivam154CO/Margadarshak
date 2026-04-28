# Ikigai - Smart College Finder (Maharashtra Engineering/Diploma Admissions)

Ikigai is a high-performance, AI-driven platform designed to simplify the complex engineering and diploma admission process in Maharashtra. It leverages historical cutoff data and advanced heuristics to provide students with accurate admission probability predictions.

## 🚀 Key Features

- **AI Admission Predictor**: Advanced rank-ratio algorithms to estimate admission chances.
- **CAP Option Form Generator**: Mathematically optimized preference lists for centralized admission rounds.
- **Dynamic Cutoff Trends**: Visualization of historical trends across multiple years.
- **Interactive College Map**: Geo-spatial search for colleges with proximity-based filtering.
- **Real-time Intelligence Feed**: Latest news and updates from DTE/CET Cell.
- **Student Dashboard**: Personalized tracking of favorite colleges, predictions, and document checklists.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS
- **State Management**: Zustand, TanStack Query (v5)
- **Animations**: Framer Motion, Lenis (Smooth Scroll)
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **ML/Analytics**: Python (Flask) with rank-ratio predictive modeling
- **Visualization**: Chart.js, Recharts, Leaflet (Maps)
- **Export**: jsPDF for generating detailed reports and option forms

## 🏗 Project Structure

```text
Ikigai/
├── MachineLearning/    # Python Flask API for predictive analytics
│   ├── app/            # Modular backend logic
│   └── core/           # Pure business logic (Predictor, Data Manager)
├── src/
│   ├── features/       # Feature-based modular structure
│   │   ├── auth/       # Authentication flow
│   │   ├── colleges/   # College search, details, and analytics
│   │   └── admission/  # CAP round management and prediction logic
│   ├── components/     # Shared UI components
│   ├── lib/            # External library configurations (Supabase, etc.)
│   └── types/          # Global TypeScript definitions
└── public/             # Static assets
```

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- Supabase account

### Frontend Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### ML API Setup
1. Navigate to `MachineLearning/`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the API:
   ```bash
   python run.py
   ```

## 📜 License
Private/Proprietary - All rights reserved.
