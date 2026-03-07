# LinkForge - Modern Frontend Interface

A modern and intuitive user interface for LinkForge, built with **React**, **TypeScript**, and **Vite**. Provides the dashboard, link management, VIP payment flow, and admin panel that connects to the LinkForge Backend API.

> [!IMPORTANT]
> This frontend requires the **Backend API** to be running. Please read the Backend README for full setup and feature documentation:
> [LinkForge Backend](https://github.com/tlavu2004/linkforge-backend)

---

## Tech Stack

- **Framework:** React 18+
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Modern CSS
- **Deployment:** Vercel (Recommended)

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/tlavu2004/linkforge-frontend.git
cd linkforge-frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
```

Update `VITE_API_BASE_URL` in `.env` to point to your running backend (default: `http://localhost:8080`).

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

---

## Deployment

The project includes `vercel.json` for one-click deployment to **Vercel**. Make sure to configure the `VITE_API_BASE_URL` environment variable in Vercel's dashboard to point to your production backend URL.

---

## Note

All business logic, API documentation, payment integration details, and architecture decisions are documented in the [Backend README](https://github.com/tlavu2004/linkforge-backend). Please read it thoroughly for a complete understanding of the system.

---

## License

This project is licensed under the [MIT License](LICENSE).
