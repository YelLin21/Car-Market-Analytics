# Car Market Analytics Dashboard

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://car-market-analytics-talarod.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF)](https://vitejs.dev/)

> A comprehensive web-based analytics platform for visualizing and analyzing used car market data

🔗 **Live Demo:** [https://car-market-analytics-talarod.vercel.app/](https://car-market-analytics-talarod.vercel.app/)

## 📋 Overview

This application processes and presents market insights from a dataset of vehicles, enabling data-driven decision-making for car market trends. Built with React and modern web technologies, it provides an intuitive interface for exploring and analyzing the used car market.

## ✨ Key Features

- **Interactive Dashboard** - Multi-view navigation with Dashboard and Highlighted sections
- **Advanced Search & Filtering** - Search capabilities for brands and models with real-time results
- **Real-time Data Aggregation** - Calculate total inventory and market values by brand/model
- **Data Visualization** - Interactive pie charts and stacked bar charts for market distribution analysis using Chart.js
- **Responsive UI** - Built with React Bootstrap for optimal experience across all devices
- **Efficient Processing** - Client-side data processing handling thousands of vehicle records

## 🛠️ Technical Stack

### Frontend
- **React 18.3.1** - Modern UI library
- **React Router 7.10.0** - SPA navigation and routing
- **React Bootstrap 2.10.10** - Responsive component library

### Data Visualization
- **Chart.js 4.5.1** - Powerful charting library
- **React-ChartJS-2 5.3.1** - React wrapper for Chart.js
- **Chroma.js 3.2.0** - Color manipulation and scales

### Build Tools & Development
- **Vite 5.4.1** - Fast build tool and dev server
- **ESLint** - Code quality and consistency
- **pnpm** - Fast, disk space efficient package manager

### Styling
- **Bootstrap 5.3.8** - CSS framework
- **Custom CSS** - Tailored styling and theming

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/YelLin21/Car-Market-Analytics.git
cd Car-Market-Analytics
```

2. Install dependencies
```bash
pnpm install
```

3. Run the development server
```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## 📂 Project Structure

```
Car-Market-Analytics/
├── public/              # Static assets
├── src/
│   ├── assets/         # Data files and resources
│   │   ├── taladrod-cars.json
│   │   └── taladrod-cars.min.json
│   ├── Components/     # React components
│   │   ├── Car.jsx
│   │   ├── DataTable.jsx
│   │   ├── Piechart.jsx
│   │   └── StackedbarChart2.jsx
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Application entry point
│   └── *.css           # Styling files
├── index.html
├── vite.config.js
└── package.json
```

## 🎯 Technical Highlights

- **Complex Data Aggregation** - Implemented efficient algorithms for calculating brand/model statistics
- **Performance Optimization** - Optimized for handling large JSON datasets with thousands of records
- **Component Architecture** - Reusable and maintainable component structure
- **Modern Deployment** - Deployed on Vercel for fast, reliable hosting

## 📊 Features in Detail

### Dashboard View
- Comprehensive data tables showing brand and model statistics
- Search functionality for quick filtering
- Total inventory counts and market values
- Visual representations through charts

### Highlighted View
- Featured vehicles and market highlights
- Curated insights for quick decision-making

### Data Analytics
- **Pie Charts** - Market share distribution by brand
- **Stacked Bar Charts** - Multi-dimensional analysis of inventory
- **Real-time Calculations** - Dynamic aggregation of market values

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**YelLin21**
- GitHub: [@YelLin21](https://github.com/YelLin21)

## 🙏 Acknowledgments

- Data sourced from Taladrod car marketplace
- Built with React and the amazing open-source community

---

**Note:** This is a frontend-only application with static data. For production use with real-time data, consider integrating with a backend API.
