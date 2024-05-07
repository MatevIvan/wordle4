import React from "react";

const VirtKeys = ({ warningLetters, correctLetters, wrongLetters, handleClick }) => {
  const keys = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m", ""],
    ["delete", "enter"],
  ];

  const allLettersData = [];

  // makes a 3d array consisting of each letter and its color, if any
  keys.forEach((row, i) => {
    allLettersData[i] = row.map((letter, j) => {
      if (warningLetters.includes(letter)) {
        return "warning-letter";
      } else if (correctLetters.includes(letter)) {
        return "correct-letter";
      } else if (wrongLetters.includes(letter)) {
        return "wrong-letter";
      } else {
        return "";
      }
    });
  });

  function className(i, j) {
    const tempKey = keys[i][j];
    if ((tempKey === "delete") | (tempKey === "enter")) {
      return "btn function";
    } else if (tempKey === "") {
      return "btn hidden";
    } else return "btn";
  }

  return (
    <div className="container bottom">
      <div className="keyboard">
        {/* Use className correct-letter, warning-letter, wrong-letter */}
        {keys.map((tmp, i) => {
          return (
            <div className="row" key={"row: " + i}>
              {keys[i].map((letter, j) => {
                return (
                  <button
                    className={className(i, j)}
                    id={allLettersData[i][j]}
                    key={i + " " + j + " " + letter}
                    onClick={handleClick}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtKeys;
