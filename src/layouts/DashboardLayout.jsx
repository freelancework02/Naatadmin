import React, { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

// simple view registry
import Dashboard from "../views/Dashboard.jsx";


const VIEWS = {
  dashboard: <Dashboard />,
 
};

export default function DashboardLayout() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onNavigate = (view) => setCurrentView(view);
  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <Topbar onMenuClick={toggleSidebar} title={currentView} />

        <main className="p-4 md:p-6 lg:p-8">
          <div className="rounded-xl border border-slate-800 bg-white p-4 md:p-6">
            {VIEWS[currentView] || <div>Not found</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
