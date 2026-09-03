import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { MobileNav } from '../components/layout/MobileNav';
import { RoleSwitcher } from '../components/layout/RoleSwitcher';
import { ToastContainer } from '../components/common/ToastContainer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <RoleSwitcher />
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <ToastContainer />
    </div>
  );
};
