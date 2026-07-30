import React, { useCallback, useEffect, useRef, useState } from "react";
import { randomWord, testLetter, wordExists, wordValue } from "./helpers/Helpers";
import { getRandomWord } from "../services/wordChecker";
import ScoreCard from "./ScoreCard";
import VirtKeys from "./VirtKeys";

const WORD_LENGTH = 6;
const MAX_ATTEMPTS = 6;
const createEmptyHistory = () =>
  Array.from({ length: MAX_ATTEMPTS }, () => new Array(WORD_LENGTH).fill(""));

const GameGrid = () => {
  const [gameHistory, setGameHistory] = useState(createEmptyHistory);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [index, setIndex] = useState(0);
  const [secretWord, setSecretWord] = useState("");
  const [isLoadingWord, setIsLoadingWord] = useState(true);
  const [wordNotice, setWordNotice] = useState("");
  const [warningLetters, setWarningLetters] = useState([]);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [playable, setPlayable] = useState(true);
  const [checkWord, setCheckWord] = useState(false);
  const [wordGuessed, setWordGuessed] = useState(false);
  const [score, setScore] = useState(0);
  const wordRequestRef = useRef(null);
  const gameReady = playable && !isLoadingWord && secretWord.length === WORD_LENGTH;

  const loadSecretWord = useCallback(async () => {
    wordRequestRef.current?.abort();
    const controller = new AbortController();
    wordRequestRef.current = controller;

    setIsLoadingWord(true);
    setWordNotice("");

    try {
      const word = await getRandomWord({
        length: WORD_LENGTH,
        commonOnly: true,
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        setSecretWord(word);
      }
    } catch (error) {
      if (controller.signal.aborted) return;

      console.warn("Unable to load a word from Word Checker:", error);
      setSecretWord(randomWord());
      setWordNotice("Word Checker unavailable. Using the offline word list.");
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingWord(false);
      }
    }
  }, []);

  useEffect(() => {
    loadSecretWord();

    return () => {
      wordRequestRef.current?.abort();
    };
  }, [loadSecretWord]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, keyCode } = event;
      if (gameReady) {
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
  }, [attemptNumber, gameHistory, gameReady, index, secretWord.length]);

  useEffect(() => {
    if (checkWord && gameReady) {
      const guessedWord = gameHistory[attemptNumber].join("");
      const isAcceptedGuess = guessedWord === secretWord || wordExists(guessedWord);

      if (isAcceptedGuess) {
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
      if (guessedWord === secretWord) {
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
    gameReady,
    secretWord,
    correctLetters,
    wrongLetters,
    warningLetters,
  ]);

  const handleClick = (letter) => {
    if (gameReady)
      switch (letter.target.textContent) {
        case "enter":
          if (
            gameHistory[attemptNumber].join("") === secretWord ||
            wordExists(gameHistory[attemptNumber].join(""))
          ) {
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
    setGameHistory(createEmptyHistory());
    setSecretWord("");
    setWordGuessed(false);
    setIndex(0);
    setPlayable(true);
    setWarningLetters([]);
    setCorrectLetters([]);
    setWrongLetters([]);
    loadSecretWord();
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
      <p className="word-status" aria-live="polite">
        {isLoadingWord ? "Loading a word…" : wordNotice}
      </p>
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
                    disabled={isLoadingWord}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          );
        })}
        {/* Show hidden word */}
        {!isLoadingWord && !playable && !wordGuessed && (
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
        {!isLoadingWord && !playable && (
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
        disabled={!gameReady}
      />
    </div>
  );
};

export default GameGrid;
