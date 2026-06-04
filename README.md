<div align="center">
  <img src="public/apple-icon.png" alt="JTResume Logo" width="120" />
  
  # 💼 JTResume
  
  **Premium, Developer-Grade Resume Builder for the Modern Era**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

  *Craft pixel-perfect, ATS-compliant resumes with cutting-edge AI enhancements, bank-grade encryption, and a breathtaking glassmorphic dark-mode UI.*

</div>

---

<br />

## 🌟 The Vision

**JTResume** is not just another resume builder. It is a full-stack, hyper-premium platform engineered specifically for professionals who demand excellence. Designed with a sophisticated obsidian dark-mode interface, it seamlessly blends aesthetic beauty with extreme functionality. 

Whether you need a flawlessly structured ATS-compliant format, AI-driven content generation, or a highly secure offline-fallback workspace, JTResume is built to elevate your career journey.

<br />

## ✨ Signature Features

### 🤖 AI-Powered Intelligence (Google Gemini)
- **Smart Content Enhancement**: Automatically generate professional summaries and rewrite experience bullets for maximum impact.
- **AI Cover Letters**: Instantly draft tailored cover letters perfectly aligned with your generated resume.
- **Mock Interviews**: Engage in realistic, interactive mock interviews driven by AI, tailored precisely to the skills listed on your resume.
- **Target ATS Scanner**: Paste any job description to automatically extract critical industry keywords and monitor your resume's dynamic match percentage as you type.

### 🎨 Hyper-Premium UI/UX
- **Dual-Pane Sliding Auth**: Experience a buttery-smooth, `framer-motion` powered side-by-side authentication flow wrapped in a vibrant mesh gradient.
- **Deluxe Customizer**: Choose from **6 Custom Layouts**, **10 Curated Accent Palettes**, and **4 Typography Pairings**.
- **Interactive 404 Void**: A breathtaking, parallax-driven glassmorphism 404 page that actively responds to mouse movements.
- **Spacing Fit Tuning**: Dynamically adjust vertical padding and line heights to guarantee your resume fits flawlessly on a single page.

### 🔒 Enterprise-Grade Security
- **Zero-Trust Encryption**: Client-side AES encryption ensures your sensitive resume data is encrypted *before* it ever touches the server.
- **Secure Sessions**: Intelligent idle auto-logout safely terminates sessions after 30 minutes of inactivity.
- **Compliance Auditor**: Automatically scans your document for hiring bias triggers (birthdates, marital status, headshots) to maintain strict EEOC compliance.

### ⚡ Engineering & Performance
- **Universal Import**: Seamlessly extract and parse structured data directly from a downloaded LinkedIn PDF or standard JSON.
- **Native PDF Exporting**: Renders a perfectly scaled, professional A4/Letter vector PDF using your browser's native print engine—bypassing bulky external libraries.
- **Local Fallback Engine**: Keep working securely even if the MongoDB connection drops; the app gracefully falls back to local storage.

<br />

## 🛠️ Technology Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | Next.js 14+ (App Router), React 19, Framer Motion |
| **Styling** | Custom Vanilla CSS, Bootstrap 5, Glassmorphism, CSS Grid |
| **Typography** | Google Fonts (*Outfit, Inter, Merriweather, Playfair Display*) |
| **Backend API** | Next.js Route Handlers, Serverless Functions |
| **Database** | MongoDB Atlas, Mongoose |
| **AI Engine** | Google GenAI (`@google/genai`) for Gemini |
| **Security** | `bcryptjs`, JWT, `crypto-js` (AES), `zod` validation |
| **Utilities** | `docx` (Word export), `isomorphic-dompurify` (XSS protection) |

<br />

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB Database URI**
- **Google Gemini API Key**

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/jtresume.git
cd jtresume
npm install
```

### 2. Environment Configuration

Create a `.env.local` or `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Launch Development Server

Fire up the local server with hot-reloading:

```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to experience the app.

### 4. Production Build

To build and run the optimized production bundle:

```bash
npm run build
npm run start
```

<br />

## 📄 License

This project is licensed under the **MIT License**. Feel free to fork, customize, and use it to build your ultimate professional profile.
