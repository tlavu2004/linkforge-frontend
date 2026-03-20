# LinkForge - Modern Frontend Interface

LinkForge Frontend is a state-of-the-art web interface built with **React 19**, **TypeScript**, and **Tailwind CSS 4**. It provides a seamless, high-performance experience for managing short links, viewing real-time analytics, and handling VIP subscriptions.

![Dashboard Preview](docs/images/dashboard_overview.png)

> [!IMPORTANT]
> This is the **Frontend** repository. It requires the [LinkForge Backend](https://github.com/tlavu2004/linkforge-backend) to be running to function correctly.

---

## Key Features

### Advanced Analytics Dashboard
Visualize your link performance with beautiful, interactive charts powered by **Recharts**:
- **Geolocation**: Map-based or list view of visitor countries and cities.
- **Device & Browser**: Breakdown of mobile vs. desktop and specific browsers.
- **Traffic Sources**: Identify top referrers and source websites.
- **Time Trends**: Interactive line charts showing click volume over hours, days, or months.

### Full Localization (i18n)
Native support for **English** and **Vietnamese**:
- Instant language switching without page reload (using `react-i18next`).
- Localized dates, numbers, and currency formatting.
- Automatic language detection based on browser settings.

### Secure User & Admin Panel
- **User Dashboard**: Create, edit, search, and delete your links in a clean, paginated table.
- **VIP Flow**: Integrated checkout UI for VIP upgrades with automated payment return handling.
- **Admin Center**: Management interface to oversee all users, their links, and project-wide statistics.

### Responsive & Premium Design
- **Tailwind CSS 4**: Utilizing the latest CSS utility framework for a sleek, glassmorphism-inspired design.
- **Lucide Icons**: Consistent, high-quality iconography across the entire app.
- **Optimized Performance**: Built with **Vite 7** for near-instant cold starts and hot module replacement (HMR).

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) |
| **Build Tool** | [Vite 7](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Routing** | [React Router 7](https://reactrouter.com/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **i18n** | [i18next](https://www.i18next.com/) |
| **HTTP Client** | [Axios](https://axios-http.com/) |

---

## Getting Started

### Prerequisites
- **Node.js 18+**
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/tlavu2004/linkforge-frontend.git
cd linkforge-frontend

# 2. Install dependencies
npm install

# 3. Configure Environment
cp .env.example .env
```

### Environment Configuration
Update `.env` with your Backend API URL:
```env
VITE_API_URL=http://localhost:8080
```

### Running Locally
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## Deployment

### Vercel (Recommended)
This project is optimized for **Vercel**. Simply connect your GitHub repository and set the `VITE_API_URL` environment variable in the Vercel Dashboard.

---

## Author
- **Trương Lê Anh Vũ** - [tlavu2004](https://github.com/tlavu2004)

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
