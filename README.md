# SortiWise: Smart AI-Based Waste Detection & Sustainability Suite

SortiWise is a futuristic, reasoning-driven waste segregation and sustainable living assistant. It adopts an AI-first approach utilizing Large Language Models (LLMs) to identify materials, provide eco-guidance, estimate carbon reductions, and gamify sustainability habits.

---

## Key Features

1. **AI Waste Segregation**: Supports webcam capture, file uploads, text queries, and speech dictation in English, Kannada, and Hindi. Provides instructions, upcycling ideas, and eco-friendly alternatives.
2. **Smart Barcode Scanner**: Simulates scanner laser beams to parse retail product packaging elements, calculate circular ratings, and recommend zero-waste alternatives.
3. **Eco-Facility Geolocation**: Queries the browser Geolocation API to find nearby dry waste bins, compost drops, or e-waste depots, calculating distance in real-time.
4. **Gamification & Habit Streaks**: Earn XP by logging scans and completing daily challenges. Level up, unlock badges, and track active streaks.
5. **AI Sustainability Coach**: A message-based chatbot terminal that answers general eco-questions and analyzes habits.
6. **Carbon Audit Exporter**: Summarizes total carbon savings and category audits, supporting print-to-PDF formatting.
7. **PWA Offline Support**: Uses service worker caching and a local rule-based keyword classifier to segment waste without internet access, syncing logs later.

---

## Directory Structure

```
sortiwise/
├── public/
│   ├── manifest.json        # PWA Manifest
│   └── sw.js               # Service Worker for Offline caching
├── src/
│   ├── components/
│   │   ├── AdminPanel.jsx   # Admin statistics & PDF printing
│   │   ├── Auth.jsx         # Sign Up / Login / Guest Mode UI
│   │   ├── BarcodeScanner.jsx # Barcode processing & simulator
│   │   ├── Coach.jsx       # AI chatbot for sustainability tips
│   │   ├── Community.jsx   # Shared achievements and local cleanup posts
│   │   ├── Dashboard.jsx   # Premium analytics widgets and charts
│   │   ├── Gamification.jsx # Streaks, XP progress, and badges
│   │   ├── History.jsx     # Filters, search, and carbon sorting
│   │   ├── Onboarding.jsx  # Welcome flow / interactive walkthrough
│   │   ├── RecyclingCenters.jsx # Geolocation-based recycling map locator
│   │   ├── Scanner.jsx     # Camera/Image/Voice/Text input scanner
│   │   └── Settings.jsx    # API Key & Supabase credentials settings
│   ├── lib/
│   │   ├── gemini.js       # Multimodal reasoning configuration
│   │   ├── offlineClassifier.js # Local offline rule-based classifier
│   │   └── supabase.js     # Supabase client and sync helpers
│   ├── App.jsx             # Main app container and routing
│   ├── index.css           # Premium glassmorphic stylesheets
│   └── main.jsx            # React root
├── index.html              # HTML templates, Google Fonts
├── package.json            # NPM dependencies
├── schema.sql              # Supabase DB schema
└── README.md               # Setup Guide
```

---

## Database Setup

Initialize the following tables in your Supabase SQL Editor:
1. Run the scripts in [schema.sql](file:///c:/Users/sanam/OneDrive/Desktop/sortiwise/schema.sql).
2. Ensure Row Level Security (RLS) is enabled (scripts included).
3. The database automatically creates user profile rows when they register.

---

## Local Setup

### Prerequisites
- Node.js (v18+)
- NPM (v9+)

### Installation
1. Clone the project and open the directory.
2. Install npm packages:
   ```bash
   npm install
   ```
3. Copy environment variables file `.env` to root:
   Create a `.env` file at the root containing:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_key_here
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *(Note: You can also leave these blank and enter them directly in the application's **Settings panel** at runtime. Guest Mode is enabled automatically if no keys are provided!)*

### Start Local Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

### Build Production Bundle
```bash
npm run build
```
Generates statically optimized assets in `/dist`.

---

## Sample AI Prompts used for Gemini Waste Classifier

To analyze waste materials effectively, SortiWise configures the Gemini model with specific prompts. The following model guidelines are executed:

### Image & Visual Reasoning Prompt:
> "Classify this waste item. Provide the response in the language: '[Language]'. You are the SortiWise AI Waste Classification Assistant... Return valid JSON matching the schema containing: itemName, category, confidence, carbonFootprintKg, disposalInstructions, reuseIdeas, alternatives, environmentalReasoning, and sustainabilityScore."

### AI Coach Prompt:
> "You are the SortiWise AI Sustainability Coach. Your goal is to guide users to live a greener, low-carbon lifestyle. Answer questions concisely, friendly, and provide helpful eco-tips. Respond in [Language]."

---

## Mobile Deployment Options

SortiWise is designed mobile-first, supporting two primary paths for mobile deployment:

### Option A: Deploy as a Progressive Web App (PWA) (Easiest)
Since SortiWise is already configured as a fully functional PWA:
1. Deploy the compiled `/dist` directory to any HTTPS-secured hosting provider (e.g., **Vercel**, **Netlify**, or **Firebase Hosting**).
2. Open the deployed URL in a mobile browser:
   - **On iOS (Safari)**: Tap the **Share** button and select **"Add to Home Screen"**.
   - **On Android (Chrome)**: Tap the **three-dots menu** and select **"Install App"** or follow the prompt at the bottom of the screen.
3. This installs SortiWise directly onto the home screen as a standalone application that behaves like a native app, supports offline caching, and runs in fullscreen.

### Option B: Build a Native App using Ionic Capacitor (For App Stores)
To bundle the React code into a native wrapper for installation on iOS or Android:

1. **Install Capacitor CLI and Core**:
   ```bash
   npm install @capacitor/core @capacitor/cli
   ```
2. **Initialize Capacitor** (Set App Name and Package ID):
   ```bash
   npx cap init SortiWise com.sortiwise.app --web-dir=dist
   ```
3. **Install Android and iOS Platforms**:
   ```bash
   npm install @capacitor/android @capacitor/ios
   ```
4. **Add the Platforms**:
   ```bash
   npx cap add android
   npx cap add ios
   ```
5. **Sync Assets** (Every time you run `npm run build` to compile code changes):
   ```bash
   npm run build
   npx cap sync
   ```
6. **Compile & Run in Emulators or Physical Devices**:
   - For Android (requires Android Studio):
     ```bash
     npx cap open android
     ```
   - For iOS (requires macOS and Xcode):
     ```bash
     npx cap open ios
     ```

