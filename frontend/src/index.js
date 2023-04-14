import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { CookiesProvider } from "react-cookie";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {  BrowserRouter } from "react-router-dom";
// optional configuration

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <BrowserRouter>
  <CookiesProvider>
    <ToastContainer closeOnClick position="bottom-center" />
    <App />
  </CookiesProvider>
  </BrowserRouter>
  // </React.StrictMode>
);
