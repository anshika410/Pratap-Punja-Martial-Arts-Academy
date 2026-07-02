import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/public/HomePage';
import CoursesPage from './pages/public/CoursesPage';
import FacilitiesPage from './pages/public/FacilitiesPage';
import TeamPage from './pages/public/TeamPage';
import BlogPage from './pages/public/BlogPage';
import ContactPage from './pages/public/ContactPage';
import GalleryPage from './pages/public/GalleryPage';
import AdminLogin from './pages/admin/AdminLogin';
import DashboardOverview from './pages/admin/DashboardOverview';
import AdminHome from './pages/admin/AdminHome';
import AdminCourses from './pages/admin/AdminCourses';
import AdminFacilities from './pages/admin/AdminFacilities';
import AdminTrainers from './pages/admin/AdminTrainers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminMedals from './pages/admin/AdminMedals';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminGallery from './pages/admin/AdminGallery';
import AdminAdmissions from './pages/admin/AdminAdmissions';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="h-10 w-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
      </Route>

      <Route path="/admin" element={<AdminLogin />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<DashboardOverview />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/facilities" element={<AdminFacilities />} />
        <Route path="/admin/trainers" element={<AdminTrainers />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/medals" element={<AdminMedals />} />
        <Route path="/admin/blogs" element={<AdminBlogs />} />
        <Route path="/admin/gallery" element={<AdminGallery />} />
        <Route path="/admin/admissions" element={<AdminAdmissions />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
