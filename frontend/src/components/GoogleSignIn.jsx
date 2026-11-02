
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const GoogleSignIn = ({ onError }) => {
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    let script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

        callback: async (response) => {
          if (!response.credential) {
            onError?.("Google authentication failed. Please try again.");
            return;
          }

          setLoading(true);

          try {
            const result = await api.post("/auth/google/", {
              credential: response.credential,
            });

            const { access, refresh, user } = result.data;

            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);

            if (user.role === "ADMIN") {
              navigate("/admin/dashboard");
            } else {
              navigate("/dashboard");
            }
          } catch (error) {
            console.error("Google authentication error:", error);

            onError?.(
              error.response?.data?.detail ||
                "Unable to sign in with Google. Please try again."
            );
          } finally {
            setLoading(false);
          }
        },
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: "outline",
            size: "large",
            shape: "rectangular",
            text: "continue_with",
            width: 320,
          }
        );
      }

      setScriptReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else if (script) {
      script.addEventListener("load", initializeGoogle);

      return () => {
        script.removeEventListener("load", initializeGoogle);
      };
    } else {
      script = document.createElement("script");

      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;

      document.head.appendChild(script);
    }

    return () => {
      window.google?.accounts?.id?.cancel();
    };
  }, [navigate, onError]);

  return (
    <div className="google-signin-container">
      <div
        ref={googleButtonRef}
        className="google-signin-button"
      />

      {loading && (
        <p className="google-signin-loading">
          Signing in with Google...
        </p>
      )}

      {!scriptReady && (
        <p className="google-signin-loading">
          Loading Google Sign-In...
        </p>
      )}
    </div>
  );
};

export default GoogleSignIn;
