import React, { useState, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Bill } from './types';
import { InvoicePrintModal } from './components/InvoicePrintModal';

// Lazy load page components for optimized bundle size & fast initial loads
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Billing = lazy(() => import('./pages/Billing').then(m => ({ default: m.Billing })));
const BillHistory = lazy(() => import('./pages/BillHistory').then(m => ({ default: m.BillHistory })));
const ProductMaster = lazy(() => import('./pages/ProductMaster').then(m => ({ default: m.ProductMaster })));
const CustomerMaster = lazy(() => import('./pages/CustomerMaster').then(m => ({ default: m.CustomerMaster })));
const Expenses = lazy(() => import('./pages/Expenses').then(m => ({ default: m.Expenses })));

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
  </div>
);

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vicky_garage_auth_token') !== null;
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [editingBillId, setEditingBillId] = useState<number | null>(null);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);

  const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem('vicky_garage_auth_token', token);
    localStorage.setItem('vicky_garage_user', JSON.stringify(user));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('vicky_garage_auth_token');
    localStorage.removeItem('vicky_garage_user');
    setIsAuthenticated(false);
  };

  const handleQuickNewBill = () => {
    setEditingBillId(null);
    setActiveTab('billing');
  };

  const handleEditBill = (billId: number) => {
    setEditingBillId(billId);
    setActiveTab('billing');
  };

  const handleFinishSave = () => {
    setEditingBillId(null);
    setActiveTab('history');
  };

  // If user is not authenticated, show secure Login Screen ONLY
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 w-full max-w-full overflow-x-hidden">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'billing') setEditingBillId(null);
          setActiveTab(tab);
        }}
        onQuickNewBill={handleQuickNewBill}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">
        <Suspense fallback={<PageLoader />}>
          {activeTab === 'dashboard' && (
            <Dashboard
              onNewBill={handleQuickNewBill}
              onViewBill={(bill) => setViewingBill(bill)}
              onViewAllHistory={() => setActiveTab('history')}
            />
          )}

          {activeTab === 'billing' && (
            <Billing
              editBillId={editingBillId}
              onFinishSave={handleFinishSave}
            />
          )}

          {activeTab === 'history' && (
            <BillHistory
              onEditBill={handleEditBill}
            />
          )}

          {activeTab === 'expenses' && <Expenses />}

          {activeTab === 'customers' && <CustomerMaster />}

          {activeTab === 'products' && <ProductMaster />}
        </Suspense>
      </main>

      {/* Viewing / Reprinting Modal from Dashboard */}
      {viewingBill && (
        <InvoicePrintModal
          bill={viewingBill}
          onClose={() => setViewingBill(null)}
        />
      )}

      {/* Application Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-4 text-xs">
        <div className="max-w-7xl mx-auto px-4 text-center flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-200">VICKY'S GARAGE</span> - Specialized in Royal Enfield | Old No: 22/2, New No: 53/2, Gangaiamman Koil Street, Choolaimedu, Chennai - 600094
          </div>
          <div>
            System Version 1.0.0 | High Fidelity Print & Master Auto-Sync
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
