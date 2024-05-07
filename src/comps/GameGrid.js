import React, { useEffect, useState } from "react";
import { randomWord, testLetter, wordExists, wordValue } from "./helpers/Helpers";
import ScoreCard from "./ScoreCard";
import VirtKeys from "./VirtKeys";

const GameGrid = () => {
  const [gameHistory, setGameHistory] = useState(Array.from(Array(6), () => new Array(6).fill("")));
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [index, setIndex] = useState(0);
  const [secretWord, setSecretWord] = useState(randomWord());
  const [warningLetters, setWarningLetters] = useState([]);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [playable, setPlayable] = useState(true);
  const [checkWord, setCheckWord] = useState(false);
  const [wordGuessed, setWordGuessed] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, keyCode } = event;
      if (playable) {
        //valid input
        if (index < secretWord.length && keyCode >= 65 && keyCode <= 90) {
          setGameHistory((current) => {
            const updatedHistory = [...current];
            updatedHistory[attemptNumber][index] = key.toLowerCase();
            return updatedHistory;
          });
          setIndex((prevIndex) => prevIndex + 1);
        }
        // enter is pressed
        if (keyCode === 13) {
          setCheckWord(true);
        }
        //Delete is pressed
        if (index >= 0 && keyCode === 8) {
          if (gameHistory[attemptNumber][index]) {
            setGameHistory((current) => {
              const updatedHistory = [...current];
              updatedHistory[attemptNumber][index] = null;
              return updatedHistory;
            });
          } else {
            setGameHistory((current) => {
              const updatedHistory = [...current];
              updatedHistory[attemptNumber][index - 1] = null;
              return updatedHistory;
            });
            if (index > 0) setIndex(index - 1);
          }
        }
        if (keyCode === 37 && index > 0) {
          setIndex(index - 1);
        }
        if (keyCode === 39 && index < secretWord.length - 1) {
          setIndex(index + 1);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameHistory, index, attemptNumber]);

  useEffect(() => {
    if (checkWord && playable) {
      if (wordExists(gameHistory[attemptNumber].join(""))) {
        gameHistory[attemptNumber].forEach((letter, j) => {
          const tmpLetter = testLetter(secretWord, letter, j);

          // Update letters based on correctness
          if (tmpLetter === "wrong-letter") {
            if (!wrongLetters.includes(letter)) {
              setWrongLetters((current) => [...current, letter]);
            }
          } else if (tmpLetter === "correct-letter") {
            if (!correctLetters.includes(letter)) {
              setCorrectLetters((current) => [...current, letter]);
            }
            if (warningLetters.includes(letter)) {
              setWarningLetters((current) => current.filter((letters) => letters !== letter));
            }
          } else if (tmpLetter === "warning-letter") {
            if (!warningLetters.includes(letter) && !correctLetters.includes(letter)) {
              setWarningLetters((current) => [...current, letter]);
            }
          }
        });
        setAttemptNumber((prevAttemptNumber) => prevAttemptNumber + 1);
        setIndex(0);
      } else {
        if (gameHistory[attemptNumber].join("").length < secretWord.length) {
          alert("Enter a " + secretWord.length + " Letter word");
        } else alert("Word does not exist");
      }
      if (gameHistory[attemptNumber].join("") === secretWord) {
        setWordGuessed(true);
        setPlayable(false);
        setScore(score + wordValue(secretWord));
      }
    }
    setCheckWord(false);
  }, [
    checkWord,
    gameHistory,
    attemptNumber,
    playable,
    secretWord,
    correctLetters,
    wrongLetters,
    warningLetters,
  ]);

  const handleClick = (letter) => {
    if (playable)
      switch (letter.target.textContent) {
        case "enter":
          if (wordExists(gameHistory[attemptNumber].join(""))) {
            setCheckWord(true);
          } else {
            if (gameHistory[attemptNumber].join("").length < secretWord.length) {
              alert("Enter a 6 Letter word");
            } else alert("Word does not exist");
          }
          break;
        case "delete":
          if (index >= 0) {
            if (gameHistory[attemptNumber][index]) {
              setGameHistory((current) => {
                const updatedHistory = [...current];
                updatedHistory[attemptNumber][index] = null;
                return updatedHistory;
              });
            } else {
              setGameHistory((current) => {
                const updatedHistory = [...current];
                updatedHistory[attemptNumber][index - 1] = null;
                return updatedHistory;
              });
              if (index > 0) setIndex(index - 1);
            }
          }
          break;
        default:
          if (index < secretWord.length && letter.target.textContent !== "") {
            setGameHistory((current) => {
              const updatedHistory = [...current];
              updatedHistory[attemptNumber][index] = letter.target.textContent;
              return updatedHistory;
            });
            setIndex((prevIndex) => prevIndex + 1);
          }
          break;
      }
  };

  if (playable && attemptNumber === 6 && !wordGuessed) {
    setPlayable(false);
    setScore(score - wordValue(secretWord));
  }
  function updateKeys(secretWord, letter, pos, currentRow) {
    for (let i = 0; i < attemptNumber && currentRow < attemptNumber; i++) {
      const tmp = testLetter(secretWord, letter, pos);
      return tmp;
    }
    return;
  }

  function playAgain() {
    setAttemptNumber(0);
    setGameHistory(Array.from(Array(6), () => new Array(6).fill(null)));
    setSecretWord(randomWord());
    setWordGuessed(false);
    setIndex(0);
    setPlayable(true);
    setWarningLetters([]);
    setCorrectLetters([]);
    setWrongLetters([]);
  }

  function updateClass(row, j) {
    if (row === attemptNumber && index === j) {
      return "box currentBox";
    }
    return "box";
  }

  const handleBoxClick = (row, j, letter) => {
    if (row === attemptNumber) {
      if (letter) {
        setGameHistory((current) => {
          const updatedHistory = [...current];
          updatedHistory[row][j] = null;
          return updatedHistory;
        });
      }
      setIndex(j);
    }
  };

  return (
    <div className="gameGrid">
      <ScoreCard score={score} attemptNumber={attemptNumber} wordValue={wordValue(secretWord)} />
      <div className="container">
        {/* Create the grid */}
        {gameHistory.map((row, i) => {
          return (
            <div className={i === attemptNumber ? "row currentRow" : "row"} key={"row_" + i}>
              {row.map((letter, j) => {
                return (
                  <button
                    className={updateClass(i, j)}
                    id={updateKeys(secretWord, letter, j, i)}
                    key={i + "_" + j + "_" + letter}
                    onClick={() => handleBoxClick(i, j, letter)}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          );
        })}
        {/* Show hidden word */}
        {!playable && !wordGuessed && (
          <div className="row">
            {secretWord.split("").map((letter, i) => {
              return (
                <button
                  className="box"
                  id="correct-letter"
                  key={`Secret_word_letter_${letter}_index:${i}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        )}
        {/* Play Again Butotn */}
        {!playable && (
          <button className="play-again" onClick={playAgain} autoFocus>
            Play Again?
          </button>
        )}
      </div>
      <VirtKeys
        warningLetters={warningLetters}
        correctLetters={correctLetters}
        wrongLetters={wrongLetters}
        handleClick={handleClick}
      />
    </div>
  );
};

export default GameGrid;
