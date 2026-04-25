import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />

      <div className="flex-grow-1 bg-light">
        <Topbar />

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;