import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f6f9",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          background: "#f4f6f9",
        }}
      >
        <Topbar />

        <main
          style={{
            padding: "24px 32px",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;