import "./App.css";
import React from "react";
import Header from "./comps/Header";
import GameGrid from "./comps/GameGrid";

function App() {
  return (
    <div className="scrollable">
      <Header />
      <GameGrid />
    </div>
  );
}

export default App;
