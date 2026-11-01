import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { PlaceOrderPage } from './pages/PlaceOrderPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { NotificationsPage } from './pages/NotificationsPage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/place-order" element={<PlaceOrderPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-semibold text-slate-700">OrderFlow AI — Microservices & Human-in-the-Loop Email Automation</p>
            <p className="mt-1 text-slate-400">
              Order Service (:3001) • Email AI Service (:3002) • Notification Service (:3003) • RabbitMQ Broker (:5672)
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
