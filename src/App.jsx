import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { GameZoneAuthProvider, useGameZoneAuth } from "./context/GameZoneAuthContext";
import { UserAuthProvider, useUserAuth } from "./context/UserAuthContext";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";
import GameZoneAuth from "./pages/GameZoneAuth";
import PortalAuth from "./pages/UserAuth";
import GameZoneDashboard from "./pages/Gamezone/GameZoneDashboard";
import AdminAuth from "./pages/Admin/AdminAuth";
import AdminPortal from "./pages/Admin/AdminPortal";
import UserPortal from "./pages/User/UserPortal";
import { ADMIN_PORTAL_PATH, ADMIN_DASHBOARD_PATH } from "./config/routes";

// Helper component to handle user authentication routing
function UserPortalAuth() {
  const navigate = useNavigate();
  const { userLogin, isUserAuthenticated } = useUserAuth();

  // If already authenticated, redirect to dashboard
  if (isUserAuthenticated) {
    return <Navigate to="/user/dashboard" replace />;
  }

  const handleAuthSuccess = async (credentials) => {
    const result = await userLogin(credentials);
    if (result.success) {
      navigate("/user/dashboard");
    }
    return result;
  };

  return <PortalAuth onAuthSuccess={handleAuthSuccess} />;
}

function AppContent() {
  const navigate = useNavigate();
  const { isAdminAuthenticated } = useAdminAuth();

  // Consume role-specific auth context hooks
  const { zoneUser, isZoneAuthenticated, zoneLogin, zoneLogout } = useGameZoneAuth();
  const { userProfile, isUserAuthenticated, userLogout } = useUserAuth();


  // Handler for Game Zone login/signup flow
  const handleGameZoneAuthSuccess = async (credentials) => {
    const result = await zoneLogin(credentials);
    if (result.success) {
      navigate("/GameZoneDashboard");
    }
    return result;
  };

  return (
    <main className="w-full min-h-screen bg-[#020208] text-slate-100">
      <Routes>
        {/* Main Interactive Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Player / User Authentication Route */}
        <Route path="/auth/user" element={<UserPortalAuth />} />

        {/* Game Zone Login / Registration */}
        <Route
          path="/GameZoneAuth"
          element={
            isZoneAuthenticated ? (
              <Navigate to="/GameZoneDashboard" replace />
            ) : (
              <GameZoneAuth
                onNavigateBack={() => navigate("/")}
                onAuthSuccess={handleGameZoneAuthSuccess}
              />
            )
          }
        />

        {/* Game Zone Protected Dashboard */}
        <Route
          path="/GameZoneDashboard"
          element={
            <ProtectedRoute 
              isAuthenticated={isZoneAuthenticated}
              redirectPath="/GameZoneAuth"
            >
              <GameZoneDashboard
                zone={zoneUser}
                onLogout={zoneLogout}
                authUser={zoneUser}
              />
            </ProtectedRoute>
          }
        />

        {/* Game Zone Dashboard Redirect Alias */}
        <Route path="/gamezone/dashboard" element={<Navigate to="/GameZoneDashboard" replace />} />

        {/* User Protected Dashboard */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute 
              isAuthenticated={isUserAuthenticated}
              redirectPath="/auth/user"
            >
              <UserPortal authUser={userProfile} onLogout={userLogout} />
            </ProtectedRoute>
          }
        />

        {/* Hidden Admin Auth */}
        <Route path={ADMIN_PORTAL_PATH} element={<AdminAuth />} />

        {/* Hidden Admin Dashboard */}
        <Route
          path={ADMIN_DASHBOARD_PATH}
          element={
            <ProtectedRoute isAuthenticated={isAdminAuthenticated} redirectPath={ADMIN_PORTAL_PATH}>
              <AdminPortal />
            </ProtectedRoute>
          }
        />

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <GameZoneAuthProvider>
        <UserAuthProvider>
          <AppContent />
        </UserAuthProvider>
      </GameZoneAuthProvider>
    </AdminAuthProvider>
  );
}
