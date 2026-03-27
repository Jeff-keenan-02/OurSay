import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import { ThemeProvider, createTheme } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure({
  Auth: {
    Cognito: {
      identityPoolId: "eu-west-1:0819e9c0-e9e6-448f-8969-ccb836debbce",
      allowGuestAccess: true,
    },
  },
});

const darkTheme = createTheme({
  name: "dark-liveness",
  overrides: [
    {
      colorMode: "dark",
      tokens: {
        colors: {
          background: {
            primary: { value: "#0f0f0f" },
            secondary: { value: "#1a1a1a" },
          },
          font: {
            primary: { value: "#ffffff" },
            secondary: { value: "#a0a0a0" },
          },
          border: {
            primary: { value: "#2a2a2a" },
          },
        },
        components: {
          button: {
            primary: {
              backgroundColor: { value: "#6366f1" },
              color: { value: "#ffffff" },
            },
          },
        },
      },
    },
  ],
});

function App() {
  const params    = new URLSearchParams(window.location.search);
  const sessionId = params.get("sessionId");

  const [status, setStatus] = useState("ready");
  const [errorDetail, setErrorDetail] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setErrorDetail("No session ID in URL");
      postToApp({ type: "LIVENESS_ERROR", message: "No session ID provided" });
      setStatus("error");
    }
  }, []);

  function postToApp(payload) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
  }

  function handleAnalysisComplete() {
    setStatus("done");
    postToApp({ type: "LIVENESS_COMPLETE", success: true, sessionId });
  }

  function handleError(error) {
    console.error("Liveness error:", error);
    const msg = error?.state || error?.message || JSON.stringify(error) || "Liveness check failed";
    setErrorDetail(msg);
    setStatus("error");
    postToApp({ type: "LIVENESS_ERROR", message: msg });
  }

  if (!sessionId || status === "error") {
    return (
      <div style={styles.center}>
        <p style={styles.errorText}>Something went wrong. Please go back and try again.</p>
        {errorDetail ? <p style={styles.errorText}>Detail: {errorDetail}</p> : null}
      </div>
    );
  }

  if (status === "done") {
    return (
      <div style={styles.center}>
        <p style={styles.successText}>✓ Verified</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <ThemeProvider theme={darkTheme} colorMode="dark">
        <FaceLivenessDetector
          sessionId={sessionId}
          region="eu-west-1"
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleError}
        />
      </ThemeProvider>
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#0f0f0f",
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#0f0f0f",
  },
  errorText: {
    color: "#ef4444",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    padding: 24,
  },
  successText: {
    color: "#22c55e",
    fontFamily: "Arial, sans-serif",
    fontSize: 24,
    fontWeight: "bold",
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
