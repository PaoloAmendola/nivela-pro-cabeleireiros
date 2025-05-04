import React from 'react';
import BottomNav from './BottomNav'; // We will create this component next

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background_light dark:bg-background_dark text-text_on_light dark:text-text_on_dark">
      {/* Header could go here if needed */}
      <main className="flex-grow pb-16"> {/* Add padding-bottom to prevent content from being hidden by BottomNav */}
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;

