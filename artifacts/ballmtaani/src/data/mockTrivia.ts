export type TriviaQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  reward: number;
};

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: "q1",
    question: "Who won the 2022 FIFA World Cup?",
    options: ["France", "Brazil", "Argentina", "Croatia"],
    correctAnswer: 2,
    reward: 10,
  },
  {
    id: "q2",
    question: "Which club does Mohamed Salah play for?",
    options: ["Chelsea", "Liverpool", "Arsenal", "Man City"],
    correctAnswer: 1,
    reward: 50,
  },
  {
    id: "q3",
    question: "Who is known as 'The Egyptian King'?",
    options: ["Sadio Mané", "Riyad Mahrez", "Mohamed Salah", "Hakim Ziyech"],
    correctAnswer: 2,
    reward: 100,
  },
  {
    id: "q4",
    question: "Which African country was the first to reach a World Cup semi-final?",
    options: ["Ghana", "Senegal", "Morocco", "Cameroon"],
    correctAnswer: 2,
    reward: 500,
  },
  {
    id: "q5",
    question: "Who is the all-time top scorer in the UEFA Champions League?",
    options: ["Lionel Messi", "Cristiano Ronaldo", "Robert Lewandowski", "Karim Benzema"],
    correctAnswer: 1,
    reward: 1000,
  },
  {
    id: "q6",
    question: "Which team has won the most English Premier League titles?",
    options: ["Arsenal", "Chelsea", "Manchester City", "Manchester United"],
    correctAnswer: 3,
    reward: 2000,
  },
  {
    id: "q7",
    question: "In what year did South Africa host the FIFA World Cup?",
    options: ["2006", "2010", "2014", "2018"],
    correctAnswer: 1,
    reward: 5000,
  },
  {
    id: "q8",
    question: "Who won the Ballon d'Or in 2007?",
    options: ["Kaká", "Ronaldinho", "Zinedine Zidane", "Fabio Cannavaro"],
    correctAnswer: 0,
    reward: 10000,
  },
  {
    id: "q9",
    question: "Which club won the first ever European Cup (now Champions League)?",
    options: ["AC Milan", "Real Madrid", "Benfica", "Bayern Munich"],
    correctAnswer: 1,
    reward: 20000,
  },
  {
    id: "q10",
    question: "Who holds the record for the most goals scored in a single Premier League season (38 games)?",
    options: ["Alan Shearer", "Mohamed Salah", "Erling Haaland", "Cristiano Ronaldo"],
    correctAnswer: 2,
    reward: 50000,
  },
  {
    id: "q11",
    question: "Which African player won the FIFA World Player of the Year in 1995?",
    options: ["George Weah", "Didier Drogba", "Samuel Eto'o", "Abedi Pele"],
    correctAnswer: 0,
    reward: 100000,
  },
  {
    id: "q12",
    question: "Which team won the Invincibles season in the Premier League?",
    options: ["Manchester United", "Chelsea", "Arsenal", "Preston North End"],
    correctAnswer: 2,
    reward: 250000,
  },
  {
    id: "q13",
    question: "Which country has won the most AFCON (Africa Cup of Nations) titles?",
    options: ["Cameroon", "Ghana", "Egypt", "Nigeria"],
    correctAnswer: 2,
    reward: 500000,
  },
  {
    id: "q14",
    question: "Who scored the fastest hat-trick in Premier League history?",
    options: ["Robbie Fowler", "Sadio Mané", "Son Heung-min", "Sergio Agüero"],
    correctAnswer: 1,
    reward: 750000,
  },
  {
    id: "q15",
    question: "Which player has won the most Champions League titles?",
    options: ["Paco Gento", "Cristiano Ronaldo", "Paolo Maldini", "Lionel Messi"],
    correctAnswer: 0,
    reward: 1000000,
  }
];
