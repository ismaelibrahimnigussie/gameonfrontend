import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { GameZoneAuthProvider, useGameZoneAuth } from './context/GameZoneAuthContext';
import { UserAuthProvider, useUserAuth } from './context/UserAuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import ProtectedRoute, { AuthBootScreen } from './components/ProtectedRoute';
import Home from './components/Home';
import GameZoneAuth from './pages/GameZoneAuth';
import PortalAuth from './pages/UserAuth';
import GameZoneDashboard from './pages/Gamezone/GameZoneDashboard';
import AdminAuth from './pages/Admin/AdminAuth';
import AdminPortal from './pages/Admin/AdminPortal';
import UserPortal from './pages/User/UserPortal';
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_PORTAL_PATH,
  GAMEZONE_AUTH_PATH,
  GAMEZONE_DASHBOARD_PATH,
  USER_AUTH_PATH,
  USER_DASHBOARD_PATH,
} from './config/routes';

function UserPortalAuth() {
  const navigate = useNavigate();
  const { isUserAuthenticated, isUserLoading } = useUserAuth();

  if (isUserLoading) {
    return <AuthBootScreen />;
  }

  if (isUserAuthenticated) {
    return <Navigate to={USER_DASHBOARD_PATH} replace />;
  }

  return <PortalAuth onAuthSuccess={() => navigate(USER_DASHBOARD_PATH)} />;
}

function AppContent() {
  const navigate = useNavigate();
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();
  const { zoneUser, isZoneAuthenticated, isZoneLoading, zoneLogout } = useGameZoneAuth();
  const { userProfile, isUserAuthenticated, isUserLoading, userLogout } = useUserAuth();

  return (
    <main className="w-full min-h-screen bg-[#020208] text-slate-100">
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path={USER_AUTH_PATH} element={<UserPortalAuth />} />

        <Route
          path={GAMEZONE_AUTH_PATH}
          element={
            isZoneLoading ? (
              <AuthBootScreen />
            ) : isZoneAuthenticated ? (
              <Navigate to={GAMEZONE_DASHBOARD_PATH} replace />
            ) : (
              <GameZoneAuth
                onNavigateBack={() => navigate('/')}
                onAuthSuccess={() => navigate(GAMEZONE_DASHBOARD_PATH)}
              />
            )
          }
        />

        <Route
          path={GAMEZONE_DASHBOARD_PATH}
          element={
            <ProtectedRoute
              isAuthenticated={isZoneAuthenticated}
              isLoading={isZoneLoading}
              redirectPath={GAMEZONE_AUTH_PATH}
            >
              <GameZoneDashboard
                zone={zoneUser}
                onLogout={zoneLogout}
                authUser={zoneUser}
              />
            </ProtectedRoute>
          }
        />

        <Route path="/gamezone/dashboard" element={<Navigate to={GAMEZONE_DASHBOARD_PATH} replace />} />

        <Route
          path={USER_DASHBOARD_PATH}
          element={
            <ProtectedRoute
              isAuthenticated={isUserAuthenticated}
              isLoading={isUserLoading}
              redirectPath={USER_AUTH_PATH}
            >
              <UserPortal authUser={userProfile} onLogout={userLogout} />
            </ProtectedRoute>
          }
        />

        <Route path={ADMIN_PORTAL_PATH} element={<AdminAuth />} />

        <Route
          path={ADMIN_DASHBOARD_PATH}
          element={
            <ProtectedRoute
              isAuthenticated={isAdminAuthenticated}
              isLoading={isAdminLoading}
              redirectPath={ADMIN_PORTAL_PATH}
            >
              <AdminPortal />
            </ProtectedRoute>
          }
        />

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
