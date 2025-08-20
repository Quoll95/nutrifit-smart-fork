import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { Header } from "./Header";

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-dashboard flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};