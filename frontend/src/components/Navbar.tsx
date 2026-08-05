import React from 'react';
import { LayoutDashboard, FileText, History, Package, Users, PlusCircle, Coins, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickNewBill: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onQuickNewBill, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'New Bill', icon: FileText },
    { id: 'history', label: 'Bill History', icon: History },
    { id: 'expenses', label: 'Expenses', icon: Coins },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-3 lg:gap-6">
          
          {/* Left Section: Company Logo Image & Two-Line Header Branding */}
          <div 
            className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 cursor-pointer select-none" 
            onClick={() => setActiveTab('dashboard')}
          >
            {/* Company Logo Image */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800 p-1 border border-slate-700/80 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src="/garage-logo.png"
                alt="Vicky's Garage Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Two-Line Title: Vicky's Garage on Line 1, Royal Enfield Specialist directly below on Line 2 */}
            <div className="flex flex-col justify-center">
              <span className="text-sm sm:text-base font-black tracking-wide text-white whitespace-nowrap leading-tight">
                VICKY'S GARAGE
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-indigo-300 tracking-normal whitespace-nowrap mt-0.5">
                Royal Enfield Specialist
              </span>
            </div>
          </div>

          {/* Center Section: Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Section: Primary Action Button & Logout */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onQuickNewBill}
              className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Create Bill</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out"
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-white border border-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center overflow-x-auto py-2 border-t border-slate-800 space-x-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800 whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

