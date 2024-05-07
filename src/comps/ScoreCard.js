import React from "react";

const ScoreCard = ({ score, attemptNumber, wordValue }) => {
  const remaining = 6 - attemptNumber;
  return (
    <div className="container">
      <div className="row">
        <button className="score">
          {"Current score: " + score + " | Attempts remaining: " + remaining}
        </button>
      </div>
      {/* <div className="row">
        <button className="score">{"Secret word value: " + wordValue}</button>
      </div> */}
    </div>
  );
};

export default ScoreCard;
