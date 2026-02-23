# Krishi Mitra - कृषि मित्र

**Your Farm's Best Friend** - Smart Irrigation Advisor + Farming Education Portal for Indian Farmers

## 🌾 About

Krishi Mitra is a comprehensive agriculture solution that provides:
- **Daily Irrigation Advice**: AI-powered recommendations based on soil moisture and crop cycle
- **Education Portal**: Videos, guides, crop calendars, and government scheme information
- **Voice Bot with RAG**: Real-time assistance for farming queries using Retrieval Augmented Generation
- **Multi-language Support**: Available in 12 Indian languages (Hindi, Marathi, Tamil, Telugu, etc.)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm (or use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```sh
# Step 1: Navigate to the project directory
cd agriwise-connect

# Step 2: Install dependencies
npm install

# Step 3: Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🛠️ Tech Stack

- **Vite** - Build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **React Router** - Routing
- **i18next** - Internationalization
- **React Query** - Data fetching

## 📱 Features

### 1. Registration Flow
- Phone OTP verification
- Language selection (12 languages)
- Farm location mapping
- Crop selection

### 2. Dashboard
- Real-time soil moisture display
- Irrigation recommendations
- Weather information
- Quick access to education content

### 3. Education Portal
- Video library
- How-to guides
- Crop calendars
- Government scheme guides (PMKSY, etc.)
- Interactive quizzes

### 4. Voice Bot (RAG-powered)
- Voice input support
- Text-to-speech responses
- Government scheme queries
- Irrigation advice
- Crop information
- Real-time RAG from vector database

### 5. Notifications
- Daily irrigation alerts
- Crop stage updates
- Scheme reminders

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000
```

## 📦 Build

```sh
# Production build
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

```sh
# Run tests
npm test

# Watch mode
npm run test:watch
```

## 📄 Project Structure

```
agriwise-connect/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── i18n/          # Translations
│   ├── contexts/       # React contexts
│   ├── hooks/         # Custom hooks
│   └── lib/           # Utilities
├── public/            # Static assets
└── package.json       # Dependencies
```

## 🌐 Backend Integration

This frontend connects to the FastAPI backend:
- Authentication: `/api/v1/auth`
- Farms: `/api/v1/farms`
- Irrigation: `/api/v1/irrigation`
- Education: `/api/v1/education`
- Voice Bot: `/api/v1/voice_bot/query`

## 📝 License

This project is part of the Krishi Mitra agriculture solution.

## 🤝 Contributing

Contributions are welcome! Please ensure code follows the project's style guidelines.
