
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import api from "../services/api";
import CandidateNav from "./CandidateNav";

function CandidateLayout() {
  const [status, setStatus] = useState("loading");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function verifyCandidate() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setStatus("unauthenticated");
        return;
      }

      setStatus("loading");

      try {
        const response = await api.get("/auth/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!active) return;

        if (response.data.role === "CANDIDATE") {
          setStatus("allowed");
        } else if (
          response.data.role === "RECRUITER" ||
          response.data.role === "ADMIN"
        ) {
          setStatus("wrong-role");
        } else {
          setStatus("unauthenticated");
        }
      } catch (error) {
        if (!active) return;

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setStatus("unauthenticated");
        } else {
          setStatus("error");
        }
      }
    }

    verifyCandidate();

    return () => {
      active = false;
    };
  }, [retry]);

  if (status === "loading") {
    return <div>Verifying your account...</div>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (status === "wrong-role") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (status === "error") {
    return (
      <div className="auth-error">
        <p>Unable to verify your account. Please try again.</p>

        <button onClick={() => setRetry((value) => value + 1)}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <CandidateNav />
      <Outlet />
    </>
  );
}

export default CandidateLayout;
