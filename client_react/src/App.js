import React from "react";
import SearchComponent from "./Components/SearchComponent/SearchComponent";
import './App.css';

function App() {
  return (
    <div className="vh-100">
      <div className="row justify-content-center align-items-center h-100">
        <div className="text-center">
          <h1 className="app-title mt-5">Price Compass</h1>
          <p className="app-description">Find the best price for your favorite products.</p>
          <SearchComponent />
        </div>
      </div>
    </div>
  );
}

export default App;
