export type TriviaQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  reward: number;
};

// Organized by Level (Difficulty 0 to 14)
// Each level has multiple variations to ensure variety on every play.
export const TRIVIA_POOL: Record<number, TriviaQuestion[]> = {
  0: [ // Level 1 - Reward: 10
    { id: "q1_1", question: "Who won the 2022 FIFA World Cup?", options: ["France", "Brazil", "Argentina", "Croatia"], correctAnswer: 2, reward: 10 },
    { id: "q1_2", question: "Which country hosted the 2024 Euro tournament?", options: ["France", "Germany", "England", "Spain"], correctAnswer: 1, reward: 10 },
    { id: "q1_3", question: "Which club won the 2023/24 Premier League title?", options: ["Arsenal", "Liverpool", "Man City", "Chelsea"], correctAnswer: 2, reward: 10 }
  ],
  1: [ // Level 2 - Reward: 50
    { id: "q2_1", question: "Which club does Mohamed Salah play for?", options: ["Chelsea", "Liverpool", "Arsenal", "Man City"], correctAnswer: 1, reward: 50 },
    { id: "q2_2", question: "Which team did Kylian Mbappé join in 2024?", options: ["Man Utd", "Real Madrid", "Bayern Munich", "Liverpool"], correctAnswer: 1, reward: 50 },
    { id: "q2_3", question: "Which striker joined Arsenal from Chelsea in 2023?", options: ["Nicolas Jackson", "Kai Havertz", "Timo Werner", "João Félix"], correctAnswer: 1, reward: 50 }
  ],
  2: [ // Level 3 - Reward: 100
    { id: "q3_1", question: "Who is known as 'The Egyptian King'?", options: ["Sadio Mané", "Riyad Mahrez", "Mohamed Salah", "Hakim Ziyech"], correctAnswer: 2, reward: 100 },
    { id: "q3_2", question: "Which nation won the 2024 AFCON title?", options: ["Nigeria", "Senegal", "Ivory Coast", "Egypt"], correctAnswer: 2, reward: 100 },
    { id: "q3_3", question: "Which manager joined Liverpool to replace Jurgen Klopp in 2024?", options: ["Xabi Alonso", "Roberto De Zerbi", "Arne Slot", "Ruben Amorim"], correctAnswer: 2, reward: 100 }
  ],
  3: [ // Level 4 - Reward: 500
    { id: "q4_1", question: "Which African country was the first to reach a World Cup semi-final?", options: ["Ghana", "Senegal", "Morocco", "Cameroon"], correctAnswer: 2, reward: 500 },
    { id: "q4_2", question: "Who won the 2024 Ballon d'Or (Men's)?", options: ["Vinícius Júnior", "Rodri", "Jude Bellingham", "Erling Haaland"], correctAnswer: 1, reward: 500 },
    { id: "q4_3", question: "Which stadium is known as the 'Home of Football'?", options: ["Old Trafford", "Camp Nou", "Wembley", "Maracanã"], correctAnswer: 2, reward: 500 }
  ],
  4: [ // Level 5 - Reward: 1,000 (SAFE HAVEN)
    { id: "q5_1", question: "Who is the all-time top scorer in the UEFA Champions League?", options: ["Lionel Messi", "Cristiano Ronaldo", "Robert Lewandowski", "Karim Benzema"], correctAnswer: 1, reward: 1000 },
    { id: "q5_2", question: "Who became Chelsea manager for the start of the 2024/25 season?", options: ["Enzo Maresca", "Mauricio Pochettino", "Thomas Tuchel", "Graham Potter"], correctAnswer: 0, reward: 1000 },
    { id: "q5_3", question: "Which team won Euro 2024?", options: ["England", "France", "Spain", "Netherlands"], correctAnswer: 2, reward: 1000 }
  ],
  5: [ // Level 6 - Reward: 2,000
    { id: "q6_1", question: "Which team has won the most English Premier League titles?", options: ["Arsenal", "Chelsea", "Manchester City", "Manchester United"], correctAnswer: 3, reward: 2000 },
    { id: "q6_2", question: "Who won the PFA Player of the Year for 2023/24?", options: ["Cole Palmer", "Phil Foden", "Declan Rice", "Ollie Watkins"], correctAnswer: 1, reward: 2000 },
    { id: "q6_3", question: "Which player holds the record for most assists in Premier League history?", options: ["Cesc Fàbregas", "Ryan Giggs", "Kevin De Bruyne", "Wayne Rooney"], correctAnswer: 1, reward: 2000 }
  ],
  6: [ // Level 7 - Reward: 5,000
    { id: "q7_1", question: "In what year did South Africa host the FIFA World Cup?", options: ["2006", "2010", "2014", "2018"], correctAnswer: 1, reward: 5000 },
    { id: "q7_2", question: "Which player was the top scorer of Euro 2024?", options: ["Harry Kane", "Dani Olmo", "Multiple Players (6)", "Jamal Musiala"], correctAnswer: 2, reward: 5000 },
    { id: "q7_3", question: "Who won the 2024 Copa América?", options: ["Brazil", "Colombia", "Argentina", "Uruguay"], correctAnswer: 2, reward: 5000 }
  ],
  7: [ // Level 8 - Reward: 10,000
    { id: "q8_1", question: "Who won the Ballon d'Or in 2007?", options: ["Kaká", "Ronaldinho", "Zinedine Zidane", "Fabio Cannavaro"], correctAnswer: 0, reward: 10000 },
    { id: "q8_2", question: "Which player has the most official goals in football history?", options: ["Pelé", "Lionel Messi", "Cristiano Ronaldo", "Josef Bican"], correctAnswer: 2, reward: 10000 },
    { id: "q8_3", question: "Which club did Jude Bellingham join from Dortmund?", options: ["Man City", "Real Madrid", "Liverpool", "Bayern Munich"], correctAnswer: 1, reward: 10000 }
  ],
  8: [ // Level 9 - Reward: 20,000
    { id: "q9_1", question: "Which club won the first ever European Cup in 1956?", options: ["AC Milan", "Real Madrid", "Benfica", "Bayern Munich"], correctAnswer: 1, reward: 20000 },
    { id: "q9_2", question: "Who managed Greece to their shock Euro 2004 victory?", options: ["Otto Rehhagel", "Luis Aragonés", "Fernando Santos", "Claudio Ranieri"], correctAnswer: 0, reward: 20000 },
    { id: "q9_3", question: "Which African nation has appeared in the most World Cup tournaments?", options: ["Nigeria", "Cameroon", "Morocco", "Egypt"], correctAnswer: 1, reward: 20000 }
  ],
  9: [ // Level 10 - Reward: 50,000 (SAFE HAVEN)
    { id: "q10_1", question: "Who holds the record for the most goals scored in a single PL season (38 games)?", options: ["Alan Shearer", "Mohamed Salah", "Erling Haaland", "Cristiano Ronaldo"], correctAnswer: 2, reward: 50000 },
    { id: "q10_2", question: "Which team won the first ever FIFA World Cup in 1930?", options: ["Brazil", "Argentina", "Uruguay", "Italy"], correctAnswer: 2, reward: 50000 },
    { id: "q10_3", question: "Who is the youngest player to score in a World Cup final?", options: ["Pelé", "Kylian Mbappé", "Lionel Messi", "Gavi"], correctAnswer: 0, reward: 50000 }
  ],
  10: [ // Level 11 - Reward: 100,000
    { id: "q11_1", question: "Which African player won the FIFA World Player of the Year in 1995?", options: ["George Weah", "Didier Drogba", "Samuel Eto'o", "Abedi Pele"], correctAnswer: 0, reward: 100000 },
    { id: "q11_2", question: "Which country has won the most FIFA World Cup titles?", options: ["Germany", "Italy", "Brazil", "Argentina"], correctAnswer: 2, reward: 100000 },
    { id: "q11_3", question: "Which player has won the most Ballon d'Or awards in history?", options: ["Cristiano Ronaldo", "Lionel Messi", "Michel Platini", "Johan Cruyff"], correctAnswer: 1, reward: 100000 }
  ],
  11: [ // Level 12 - Reward: 250,000
    { id: "q12_1", question: "Which team recorded the famous 'Invincibles' season in the PL (2003/04)?", options: ["Man Utd", "Chelsea", "Arsenal", "Liverpool"], correctAnswer: 2, reward: 250000 },
    { id: "q12_2", question: "Who scored the 1000th goal in World Cup history?", options: ["Pelé", "Rob Rensenbrink", "Gerd Müller", "Diego Maradona"], correctAnswer: 1, reward: 250000 },
    { id: "q12_3", question: "Which goalkeeper has kept the most clean sheets in Premier League history?", options: ["David De Gea", "Peter Schmeichel", "Petr Cech", "David James"], correctAnswer: 2, reward: 250000 }
  ],
  12: [ // Level 13 - Reward: 500,000
    { id: "q13_1", question: "Which country has won the most AFCON titles?", options: ["Cameroon", "Ghana", "Egypt", "Nigeria"], correctAnswer: 2, reward: 500000 },
    { id: "q13_2", question: "Who holds the record for most career assists for a single club?", options: ["Ryan Giggs", "Lionel Messi", "Thomas Müller", "Xavi"], correctAnswer: 1, reward: 500000 },
    { id: "q13_3", question: "Who scored the winning goal in the 2010 World Cup Final?", options: ["Xavi", "David Villa", "Andrés Iniesta", "Fernando Torres"], correctAnswer: 2, reward: 500000 }
  ],
  13: [ // Level 14 - Reward: 750,000
    { id: "q14_1", question: "Who scored the fastest hat-trick in Premier League history (2m 56s)?", options: ["Robbie Fowler", "Sadio Mané", "Son Heung-min", "Sergio Agüero"], correctAnswer: 1, reward: 750000 },
    { id: "q14_2", question: "Which player has played for most clubs in Champions League history?", options: ["Zlatan Ibrahimović", "Nicolas Anelka", "Samuel Eto'o", "Cristiano Ronaldo"], correctAnswer: 0, reward: 750000 },
    { id: "q14_3", question: "Which stadium has hosted the most World Cup final matches?", options: ["Maracanã", "Wembley", "Estadio Azteca", "Rose Bowl"], correctAnswer: 2, reward: 750000 }
  ],
  14: [ // Level 15 - Reward: 1,000,000 (GRAND PRIZE)
    { id: "q15_1", question: "Which player has won the most European Cup/Champions League titles as a player?", options: ["Paco Gento", "Cristiano Ronaldo", "Paolo Maldini", "Luka Modrić"], correctAnswer: 0, reward: 1000000 },
    { id: "q15_2", question: "Who is the only player to have won three FIFA World Cup titles?", options: ["Diego Maradona", "Pelé", "Franz Beckenbauer", "Lionel Messi"], correctAnswer: 1, reward: 1000000 },
    { id: "q15_3", question: "Which team has lost the most World Cup finals?", options: ["Netherlands", "Germany", "Argentina", "France"], correctAnswer: 1, reward: 1000000 }
  ]
};

// Shuffling Helper
export function getRandomTriviaSet(): TriviaQuestion[] {
  const set: TriviaQuestion[] = [];
  for (let level = 0; level < 15; level++) {
    const variations = TRIVIA_POOL[level];
    const randomIndex = Math.floor(Math.random() * variations.length);
    set.push(variations[randomIndex]);
  }
  return set;
}

// Fallback for static imports if needed (uses the first variation by default)
export const TRIVIA_QUESTIONS = getRandomTriviaSet();
