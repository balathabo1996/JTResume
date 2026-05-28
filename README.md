# 💼 JTResume — Premium Full-Stack Resume Builder

JTResume is a modern, full-stack Next.js web application designed to help job seekers build, customize, and export professional, ATS-compliant resumes. It features a sophisticated obsidian dark-mode interface, AI-powered content enhancements, passwordless authentication, and dynamic design templates.

---

## ✨ Key Features

* **🧠 AI-Powered Content Enhancement**: Integrates Google Gemini AI to automatically generate professional summaries, enhance experience bullet points, and optimize your resume for target roles.
* **☁️ Cloud Sync & Local Storage**: Save your resume profiles to a MongoDB database for access across devices, or keep everything strictly private within your browser's local storage.
* **🎨 Deluxe Design Customizer**: Fine-tune themes instantly:
  * **6 Custom Layout Styles**: Classic Formal, Modern Minimalist, Creative Executive (2-column sidebar), Executive Prestige, Tech Minimalist, and Academic Editorial.
  * **10 Curated Accent Palettes**: Professionally balanced color presets.
  * **4 Typography Pairings**: Modern Sans, Editorial Serif, Tech Clean, and Corporate.
  * **Spacing Fit Tuning**: Dynamically adjust vertical padding and line heights to make your resume fit exactly on a single page.
* **📄 Advanced Exporting**: Instantly export a perfectly scaled, professional A4/Letter vector PDF using your browser's native print engine, or download an editable Word Document (`.docx`).
* **🔍 Target Job ATS Scanner**: Paste any job description to automatically extract critical industry keywords and monitor your resume's dynamic keyword match percentage as you write.
* **⚠️ Smart Compliance Auditor**: Scan for potential hiring bias and anti-patterns (such as marital status, birthdates, and headshots) to ensure compliance with Equal Employment Opportunity Commission (EEOC) standards.

---

## 🛠️ Technology Stack

**Frontend:**
* **Framework**: Next.js (App Router)
* **UI & Styling**: React 19, Bootstrap 5, Premium Custom Vanilla CSS (with CSS grid, flexbox, glassmorphic card overlays, neon gradients, and active step pulsing micro-animations)
* **Fonts**: Google Fonts (Outfit, Inter, Merriweather, Playfair Display, Roboto Mono)

**Backend:**
* **API**: Next.js Route Handlers
* **Database**: MongoDB
* **AI Integration**: Google GenAI (`@google/genai`) for Gemini
* **Authentication**: `bcryptjs`
* **Utilities**: `docx` for Word exports, `nodemailer` for communications, `isomorphic-dompurify` for XSS protection

---

## 💻 Local Installation & Setup

### Prerequisites
* Node.js (v18+)
* MongoDB Cluster / Database URI
* Google Gemini API Key

### Getting Started

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/jtresume.git
   cd jtresume
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` or `.env` file in the root directory and configure the necessary keys:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   # Add other required SMTP or Auth variables depending on the configuration
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.*

5. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📄 License

This project is licensed under the MIT License — feel free to customize and use it for your own resume-building goals!
