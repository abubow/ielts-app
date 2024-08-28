"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type QuestionsData = Record<string, string[]>;

export default function Home() {
  const [questions, setQuestions] = useState<[string, string][]>([]); // [topic, question]
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(180); // Time in seconds (3 minutes)

  useEffect(() => {
    // Fetch questions from the JSON file in the public folder
    async function fetchQuestions() {
      try {
        const response = await fetch("/questions.json");
        const data: QuestionsData = await response.json();
        const allQuestions = Object.entries(data).flatMap(([topic, qs]) =>
          qs.map((question) => [topic, question])
        );
        setQuestions(allQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    }

    fetchQuestions();

    // Set an interval to update the time every second
    const timeInterval = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          // When time runs out, change to the next question
          changeQuestion();
          return 180; // Reset time for the next question (3 minutes)
        }
      });
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const changeQuestion = () => {
    setCurrentQuestionIndex((prevIndex) =>
      questions.length > 0 ? (prevIndex + 1) % questions.length : 0
    );
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const currentQuestion =
    questions.length > 0 ? questions[currentQuestionIndex] : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-10 bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-black">
      {/* Remaining Time Display */}
      <div className="fixed top-5 right-5 p-3 rounded-md bg-white dark:bg-gray-800 shadow-md">
        <p className="text-lg font-mono">Time Left: {formatTime(remainingTime)}</p>
      </div>

      {/* Random Question Display */}
      <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {currentQuestion ? currentQuestion[0] : "Loading..."}
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
          {currentQuestion ? currentQuestion[1] : "Loading..."}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-10">
        <Image
          src="/next.svg"
          alt="Next.js Logo"
          width={100}
          height={24}
          className="dark:invert"
          priority
        />
      </div>
    </main>
  );
}
