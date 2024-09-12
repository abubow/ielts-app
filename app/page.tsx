"use client";

import { useEffect, useState } from "react";

type QuestionsData = Record<string, string[]>;

function randomize(arr: any[]) {
  return arr.sort(() => Math.random() - 0.5);
}

export default function Home() {
  const [questions, setQuestions] = useState<[string, string][]>([]); // [topic, question]
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(180); // Time in seconds

  // Fetch questions from the JSON file in the public folder
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch("/questions.json");
        const data: QuestionsData = await response.json();
        const allQuestions = randomize(
          Object.entries(data).flatMap(([topic, qs]) =>
            qs.map((question) => [topic, question])
          )
        );
        setQuestions(allQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    }

    fetchQuestions();
  }, []);

  // Handle the time interval and question change
  useEffect(() => {
    if (questions.length === 0) return; // Ensure questions are loaded before setting up the interval

    const changeQuestion = () => {
      setCurrentQuestionIndex((prevIndex) =>
        questions.length > 0 ? (prevIndex + 1) % questions.length : 0
      );
    };

    const timeInterval = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          // When time runs out, change to the next question
          console.log("Changing question...");
          changeQuestion();
          return 180; // Reset time for the next question
        }
      });
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [questions]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Derived current question based on state
  const currentQuestion =
    questions.length > 0 ? questions[currentQuestionIndex] : null;

  // Extract current topic
  const currentTopic = currentQuestion ? currentQuestion[0] : null;

  // Filter questions by current topic
  const questionsInCurrentTopic = questions.filter(
    (q) => q[0] === currentTopic
  );

  useEffect(() => {
    if (currentQuestion) {
      console.log("Current question updated:", currentQuestion); // This should now run correctly
    }
  }, [currentQuestion]);

  return (
    <main className="flex max-h-screen p-10 bg-gradient-to-b gap-5 from-gray-100 to-white dark:from-gray-900 dark:to-black">
      {/* Sidebar */}
      <aside className="w-1/4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-screen overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Topic: {currentTopic}
        </h3>
        <ul className="space-y-2">
          {questionsInCurrentTopic.map((q, index) => (
            <li
              key={index}
              className={`cursor-pointer px-4 rounded ${
                questions[currentQuestionIndex][1] === q[1] // Check if this is the current question
                  ? "bg-teal-500 py-8 text-white font-bold"
                  : "bg-gray-700 py-2 dark:bg-gray-700 text-gray-400"
              } hover:bg-blue-400 hover:text-white transition-all`}
              onClick={() =>
                setCurrentQuestionIndex(
                  questions.findIndex(
                    (question) =>
                      question[1] === q[1] && question[0] === currentTopic
                  )
                )
              }
            >
              {q[1]} {/* Display the question text */}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center w-3/4 p-10 max-h-svh bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Remaining Time Display */}
        <div className="fixed top-5 right-5 p-6 rounded-md bg-white dark:bg-gray-800 shadow-md shadow-black">
          <p className="text-2xl font-bold font-mono">
            {formatTime(remainingTime)}
          </p>
        </div>

        {/* Random Question Display */}
        <h2 className="font-bold text-2xl text-gray-700 dark:text-gray-600 mb-16">
          {currentQuestion ? currentQuestion[0] : "Loading..."}
        </h2>
        <p className="text-4xl text-gray-900 dark:text-white">
          {currentQuestion ? currentQuestion[1] : "Loading..."}
        </p>

        {/* Footer */}
      </div>
    </main>
  );
}
