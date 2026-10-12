import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CandidateApprovals } from './pages/admin/CandidateApprovals';
import { QuestionBank } from './pages/admin/QuestionBank';
import { ExamManagement } from './pages/admin/ExamManagement';
import { CentresManagement } from './pages/admin/CentresManagement';
import { HRManagement } from './pages/admin/HRManagement';
import { ExamReports } from './pages/admin/ExamReports';

// Candidate Pages
import { CandidateProfile } from './pages/candidate/CandidateProfile';
import { CandidateJobs } from './pages/candidate/CandidateJobs';
import { CandidateExams } from './pages/candidate/CandidateExams';
import { ExamSession } from './pages/candidate/ExamSession';
import { CandidateResultReport } from './pages/candidate/CandidateResultReport';
import { CandidateApplications } from './pages/candidate/CandidateApplications';

// HR Pages
import { HRDashboard } from './pages/hr/HRDashboard';
import { HRCandidates } from './pages/hr/HRCandidates';
import { HRApplications } from './pages/hr/HRApplications';
import { HREmployees } from './pages/hr/HREmployees';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/candidates"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CandidateApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <QuestionBank />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exams"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ExamManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/centres"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CentresManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hr-management"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <HRManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ExamReports />
              </ProtectedRoute>
            }
          />

          {/* Candidate Protected Routes */}
          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/jobs"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/exams"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/exam/:attemptId"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <ExamSession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/results"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateResultReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/results/:resultId"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'HR', 'ADMIN']}>
                <CandidateResultReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/applications"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <CandidateApplications />
              </ProtectedRoute>
            }
          />

          {/* HR Protected Routes */}
          <Route
            path="/hr"
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/candidates"
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <HRCandidates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/applications"
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <HRApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/employees"
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <HREmployees />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
