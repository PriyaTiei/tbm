import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { CookiesProvider } from "react-cookie";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux"; 
import { store } from "./store";
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import "./index.css";

// Bypass browser/proxy HTTP disk cache on all API GET requests
axios.interceptors.request.use((config) => {
  if (!config.method || config.method.toLowerCase() === "get") {
    config.headers = config.headers || {};
    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";
  }
  return config;
});

// Clear any legacy service worker or CacheStorage entries that might serve stale UI/data
if (typeof window !== "undefined") {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    }).catch(() => {});
  }
  if ("caches" in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    }).catch(() => {});
  }
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  });
}
// optional configuration

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <BrowserRouter>
      <CookiesProvider>
        <ToastContainer closeOnClick position="bottom-center" />
        <App />
      </CookiesProvider>
    </BrowserRouter>
  </Provider>
  // </React.StrictMode>
);
