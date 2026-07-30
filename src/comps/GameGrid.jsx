import React, { useCallback, useEffect, useRef, useState } from "react";
import { randomWord, testLetter, wordExists, wordValue } from "./helpers/Helpers";
import { checkWordExists, getRandomWord } from "../services/wordChecker";
import Popup from "./Popup";
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
  const [isUsingLocalDictionary, setIsUsingLocalDictionary] = useState(false);
  const [wordNotice, setWordNotice] = useState("");
  const [warningLetters, setWarningLetters] = useState([]);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [playable, setPlayable] = useState(true);
  const [isCheckingWord, setIsCheckingWord] = useState(false);
  const [wordGuessed, setWordGuessed] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [score, setScore] = useState(0);
  const wordRequestRef = useRef(null);
  const guessRequestRef = useRef(null);
  const gameReady = playable && !isLoadingWord && secretWord.length === WORD_LENGTH;
  const inputReady = gameReady && !isCheckingWord && !popupMessage;

  const closePopup = useCallback(() => {
    setPopupMessage("");
  }, []);

  const showGuessError = useCallback(
    (guessedWord) => {
      if (guessedWord.length < secretWord.length) {
        setPopupMessage(`Enter a ${secretWord.length}-letter word.`);
      } else {
        setPopupMessage(
          isUsingLocalDictionary
            ? "That word is not in the local dictionary."
            : "That word was not recognized.",
        );
      }
    },
    [isUsingLocalDictionary, secretWord.length],
  );

  const loadSecretWord = useCallback(async () => {
    wordRequestRef.current?.abort();
    const controller = new AbortController();
    wordRequestRef.current = controller;

    setIsLoadingWord(true);
    setIsUsingLocalDictionary(false);
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
      setIsUsingLocalDictionary(true);
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
      guessRequestRef.current?.abort();
      guessRequestRef.current = null;
    };
  }, [loadSecretWord]);

  const submitGuess = useCallback(async () => {
    if (!gameReady || guessRequestRef.current) return;

    const guessedWord = gameHistory[attemptNumber].join("");

    if (guessedWord.length < secretWord.length) {
      showGuessError(guessedWord);
      return;
    }

    let isAcceptedGuess = guessedWord === secretWord || wordExists(guessedWord);

    if (!isAcceptedGuess && !isUsingLocalDictionary) {
      const controller = new AbortController();
      guessRequestRef.current = controller;
      setIsCheckingWord(true);

      try {
        isAcceptedGuess = await checkWordExists(guessedWord, {
          signal: controller.signal,
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        console.warn("Unable to validate a word with Word Checker:", error);
        setPopupMessage("Unable to check that word right now. Please try again.");
        return;
      } finally {
        if (guessRequestRef.current === controller) {
          guessRequestRef.current = null;
          setIsCheckingWord(false);
        }
      }
    }

    if (!isAcceptedGuess) {
      showGuessError(guessedWord);
      return;
    }

    gameHistory[attemptNumber].forEach((letter, position) => {
      const letterState = testLetter(secretWord, letter, position);

      if (letterState === "wrong-letter") {
        setWrongLetters((current) =>
          current.includes(letter) ? current : [...current, letter],
        );
      } else if (letterState === "correct-letter") {
        setCorrectLetters((current) =>
          current.includes(letter) ? current : [...current, letter],
        );
        setWarningLetters((current) =>
          current.filter((warningLetter) => warningLetter !== letter),
        );
      } else if (letterState === "warning-letter") {
        setWarningLetters((current) => {
          if (current.includes(letter) || correctLetters.includes(letter)) {
            return current;
          }

          return [...current, letter];
        });
      }
    });

    setAttemptNumber((current) => current + 1);
    setIndex(0);

    if (guessedWord === secretWord) {
      setWordGuessed(true);
      setPlayable(false);
      setScore((current) => current + wordValue(secretWord));
    }
  }, [
    attemptNumber,
    correctLetters,
    gameHistory,
    gameReady,
    isUsingLocalDictionary,
    secretWord,
    showGuessError,
  ]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, keyCode } = event;
      if (inputReady) {
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
          submitGuess();
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
  }, [
    attemptNumber,
    gameHistory,
    index,
    inputReady,
    secretWord.length,
    submitGuess,
  ]);

  const handleClick = (letter) => {
    if (inputReady)
      switch (letter.target.textContent) {
        case "enter":
          submitGuess();
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
    guessRequestRef.current?.abort();
    guessRequestRef.current = null;
    setAttemptNumber(0);
    setGameHistory(createEmptyHistory());
    setSecretWord("");
    setWordGuessed(false);
    setIsCheckingWord(false);
    setPopupMessage("");
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
        {isLoadingWord
          ? "Loading a word…"
          : isCheckingWord
            ? "Checking word…"
            : wordNotice}
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
        disabled={!inputReady}
      />
      <Popup message={popupMessage} onClose={closePopup} />
    </div>
  );
};

export default GameGrid;
