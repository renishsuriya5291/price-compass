import React from "react";
import SearchComponent from "./Components/SearchComponent/SearchComponent";
import './App.css';
import Navbar from "./Components/Navbar/Navbar";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Home from "./Components/Home/Home";
import ReviewComponent from "./Components/ReviewComponent/ReviewComponent";
import Reviews from "./Components/Reviews/Reviews";
import { CSSTransition, TransitionGroup } from "react-transition-group";

function App() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <TransitionGroup>
        <CSSTransition key={location.key} classNames="fade" timeout={100}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/reviews" element={<Reviews />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </>
  );
}

// Wrap App in Router outside of the component for correct use of useLocation
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
