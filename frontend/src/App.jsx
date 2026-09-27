import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import CandidateLayout from "./components/CandidateLayout";
import RecruiterLayout from "./components/RecruiterLayout";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Candidate pages
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Resume from "./pages/Resume";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Applications from "./pages/Applications";
import Analysis from "./pages/Analysis";

// Recruiter pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminJobs from "./pages/AdminJobs";
import AdminCreateJob from "./pages/AdminCreateJob";
import AdminCandidates from "./pages/AdminCandidates";
import AdminCandidateDetail from "./pages/AdminCandidateDetail";
import AdminApplications from "./pages/AdminApplications";
import AdminApplicationReview from "./pages/AdminApplicationReview";

function App() {
  return (
    <BrowserRouter>
      {/*
        Public Navbar
        The Navbar component automatically hides itself
        on authenticated workspace pages.
      */}
      <Navbar />

      <Routes>
        {/* =========================================
            PUBLIC ROUTES
        ========================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =========================================
            CANDIDATE WORKSPACE
        ========================================= */}

        <Route element={<CandidateLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/resumes"
            element={<Resume />}
          />

          <Route
            path="/jobs"
            element={<Jobs />}
          />

          <Route
            path="/jobs/:id"
            element={<JobDetails />}
          />

          <Route
            path="/applications"
            element={<Applications />}
          />

          <Route
            path="/analysis"
            element={<Analysis />}
          />

          <Route
            path="/analysis/:applicationId"
            element={<Analysis />}
          />
        </Route>

        {/* =========================================
            RECRUITER WORKSPACE
        ========================================= */}

        <Route
          path="/admin"
          element={<RecruiterLayout />}
        >
          {/* Recruiter Dashboard */}
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          {/* Recruiter Jobs */}
          <Route
            path="jobs"
            element={<AdminJobs />}
          />

          <Route
            path="jobs/create"
            element={<AdminCreateJob />}
          />

          {/* Recruiter Candidates */}
          <Route
            path="candidates"
            element={<AdminCandidates />}
          />

          <Route
            path="candidates/:id"
            element={<AdminCandidateDetail />}
          />

          {/* Recruiter Applications */}
          <Route
            path="applications"
            element={<AdminApplications />}
          />

          <Route
            path="applications/:id"
            element={<AdminApplicationReview />}
          />
        </Route>

        {/* =========================================
            FALLBACK
        ========================================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;