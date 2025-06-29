export interface PuzzleTemplate {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'super_hard';
  category: string;
}

// Large collection of puzzle templates
export const puzzleTemplates: PuzzleTemplate[] = [
  // Easy Puzzles
  {
    question: "What has keys but no locks, space but no room, and you can enter but not go inside?",
    answer: "keyboard",
    difficulty: "easy",
    category: "riddles"
  },
  {
    question: "What gets wet while drying?",
    answer: "towel",
    difficulty: "easy",
    category: "riddles"
  },
  {
    question: "What has hands but cannot clap?",
    answer: "clock",
    difficulty: "easy",
    category: "riddles"
  },
  {
    question: "What has a head and a tail but no body?",
    answer: "coin",
    difficulty: "easy",
    category: "riddles"
  },
  {
    question: "What can travel around the world while staying in a corner?",
    answer: "stamp",
    difficulty: "easy",
    category: "riddles"
  },
  {
    question: "What has one eye but cannot see?",
    answer: "needle",
    difficulty: "easy",
    category: "riddles"
  },
  {
    question: "What goes up but never comes down?",
    answer: "age",
    difficulty: "easy",
    category: "riddles"
  },
  {
    question: "What has teeth but cannot bite?",
    answer: "zipper",
    difficulty: "easy",
    category: "riddles"
  },
  {
    question: "What can you catch but not throw?",
    answer: "cold",
    difficulty: "easy",
    category: "riddles"
  },
  {
    question: "What has a neck but no head?",
    answer: "bottle",
    difficulty: "easy",
    category: "riddles"
  },

  // Medium Puzzles
  {
    question: "I speak without a mouth and hear without ears. I have no body, but come alive with the wind. What am I?",
    answer: "echo",
    difficulty: "medium",
    category: "riddles"
  },
  {
    question: "The more you take, the more you leave behind. What am I?",
    answer: "footsteps",
    difficulty: "medium",
    category: "riddles"
  },
  {
    question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    answer: "map",
    difficulty: "medium",
    category: "riddles"
  },
  {
    question: "What can fill a room but takes up no space?",
    answer: "light",
    difficulty: "medium",
    category: "riddles"
  },
  {
    question: "I'm tall when I'm young, and short when I'm old. What am I?",
    answer: "candle",
    difficulty: "medium",
    category: "riddles"
  },
  {
    question: "What breaks but never falls, and what falls but never breaks?",
    answer: "day",
    difficulty: "medium",
    category: "riddles"
  },
  {
    question: "I have branches, but no fruit, trunk, or leaves. What am I?",
    answer: "bank",
    difficulty: "medium",
    category: "riddles"
  },
  {
    question: "What gets bigger the more you take away from it?",
    answer: "hole",
    difficulty: "medium",
    category: "riddles"
  },
  {
    question: "I'm not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?",
    answer: "fire",
    difficulty: "medium",
    category: "riddles"
  },
  {
    question: "What has many rings but no fingers?",
    answer: "tree",
    difficulty: "medium",
    category: "riddles"
  },

  // Hard Puzzles
  {
    question: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?",
    answer: "fire",
    difficulty: "hard",
    category: "riddles"
  },
  {
    question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
    answer: "m",
    difficulty: "hard",
    category: "wordplay"
  },
  {
    question: "I have keys but no locks. I have space but no room. You can enter, but you can't go outside. What am I?",
    answer: "keyboard",
    difficulty: "hard",
    category: "riddles"
  },
  {
    question: "The person who makes it, sells it. The person who buys it never uses it. The person who uses it doesn't know they're using it. What is it?",
    answer: "coffin",
    difficulty: "hard",
    category: "riddles"
  },
  {
    question: "What word becomes shorter when you add two letters to it?",
    answer: "short",
    difficulty: "hard",
    category: "wordplay"
  },
  {
    question: "I am taken from a mine, and shut up in a wooden case, from which I am never released, and yet I am used by almost everybody. What am I?",
    answer: "pencil",
    difficulty: "hard",
    category: "riddles"
  },
  {
    question: "What disappears as soon as you say its name?",
    answer: "silence",
    difficulty: "hard",
    category: "riddles"
  },
  {
    question: "I have a golden head and a golden tail, but no golden body. What am I?",
    answer: "coin",
    difficulty: "hard",
    category: "riddles"
  },
  {
    question: "What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?",
    answer: "river",
    difficulty: "hard",
    category: "riddles"
  },
  {
    question: "Forward I am heavy, but backward I am not. What am I?",
    answer: "ton",
    difficulty: "hard",
    category: "wordplay"
  },

  // Super Hard Puzzles
  {
    question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
    answer: "m",
    difficulty: "super_hard",
    category: "wordplay"
  },
  {
    question: "I am the beginning of the end, and the end of time and space. I am essential to creation, and I surround every place. What am I?",
    answer: "e",
    difficulty: "super_hard",
    category: "wordplay"
  },
  {
    question: "What English word has three consecutive double letters?",
    answer: "bookkeeper",
    difficulty: "super_hard",
    category: "wordplay"
  },
  {
    question: "I am a word of letters three, add two and fewer there will be. What am I?",
    answer: "few",
    difficulty: "super_hard",
    category: "wordplay"
  },
  {
    question: "What 8-letter word can have a letter taken away and it still makes a word. Take another letter away and it still makes a word. Keep on doing that until you have one letter left. What is the word?",
    answer: "starting",
    difficulty: "super_hard",
    category: "wordplay"
  },
  {
    question: "I am a five-letter word. Take away my first letter, and I am a crime. Take away my first two letters, and I am an animal. Take away my first and last letters, and I am a form of music. What am I?",
    answer: "grape",
    difficulty: "super_hard",
    category: "wordplay"
  },
  {
    question: "What word in the English language does the following: the first two letters signify a male, the first three letters signify a female, the first four letters signify a great, while the entire world signifies a great woman. What is the word?",
    answer: "heroine",
    difficulty: "super_hard",
    category: "wordplay"
  },
  {
    question: "I am a 10-letter word. My 1st, 2nd, and 6th letters spell out a pet. My 6th, 7th, and 8th letters spell out a very fast gait. My 9th and 10th letters spell out a part of the body. My 3rd, 4th, and 5th letters spell out a number. What am I?",
    answer: "calculator",
    difficulty: "super_hard",
    category: "wordplay"
  },
  {
    question: "What has a golden head and a golden tail, but no golden body?",
    answer: "coin",
    difficulty: "super_hard",
    category: "riddles"
  },
  {
    question: "I have no voice and yet I speak to you, I tell of all things in the world that people do. I have leaves, but I am not a tree, I have pages, but I am not a bride or royalty. I have a spine and hinges, but I am not a man or a door, I have told you all, I cannot tell you more. What am I?",
    answer: "book",
    difficulty: "super_hard",
    category: "riddles"
  },

  // Math Puzzles
  {
    question: "If you multiply this number by any other number, the answer will always be the same. What number is this?",
    answer: "zero",
    difficulty: "easy",
    category: "math"
  },
  {
    question: "What is the next number in this sequence: 2, 4, 8, 16, 32, ?",
    answer: "64",
    difficulty: "medium",
    category: "math"
  },
  {
    question: "I am an odd number. Take away a letter and I become even. What number am I?",
    answer: "seven",
    difficulty: "hard",
    category: "math"
  },
  {
    question: "What is the smallest number that increases by 12 when it is flipped and turned upside down?",
    answer: "86",
    difficulty: "super_hard",
    category: "math"
  },

  // Logic Puzzles
  {
    question: "A man lives on the 20th floor of an apartment building. Every morning he takes the elevator down to the ground floor. When he comes home, he takes the elevator to the 10th floor and walks the rest of the way... except on rainy days, when he takes the elevator all the way to the 20th floor. Why?",
    answer: "umbrella",
    difficulty: "hard",
    category: "logic"
  },
  {
    question: "A woman shoots her husband, then holds him underwater for five minutes. Next, she hangs him. Right after, they enjoy a lovely dinner. How?",
    answer: "photograph",
    difficulty: "hard",
    category: "logic"
  },

  // Technology Puzzles
  {
    question: "What do you call a computer that sings?",
    answer: "dell",
    difficulty: "easy",
    category: "tech"
  },
  {
    question: "I am a programming language named after a snake. What am I?",
    answer: "python",
    difficulty: "easy",
    category: "tech"
  },
  {
    question: "What has a mouse but is not an animal?",
    answer: "computer",
    difficulty: "easy",
    category: "tech"
  },
  {
    question: "I am a method of storing data that follows Last In, First Out principle. What am I?",
    answer: "stack",
    difficulty: "medium",
    category: "tech"
  },
  {
    question: "What programming concept allows a function to call itself?",
    answer: "recursion",
    difficulty: "hard",
    category: "tech"
  }
];

// Function to get random puzzles that haven't been used
export const getRandomPuzzles = (existingPuzzles: any[], count: number = 5): PuzzleTemplate[] => {
  // Get questions that are already used
  const usedQuestions = new Set(existingPuzzles.map(p => p.question.toLowerCase()));
  
  // Filter out already used puzzles
  const availablePuzzles = puzzleTemplates.filter(
    template => !usedQuestions.has(template.question.toLowerCase())
  );
  
  if (availablePuzzles.length === 0) {
    console.log('All puzzles have been used! Consider adding more templates.');
    return [];
  }
  
  // Shuffle and take the requested count
  const shuffled = [...availablePuzzles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Function to generate puzzles with proper distribution
export const generateBalancedPuzzles = (existingPuzzles: any[], count: number = 5): PuzzleTemplate[] => {
  const usedQuestions = new Set(existingPuzzles.map(p => p.question.toLowerCase()));
  const availablePuzzles = puzzleTemplates.filter(
    template => !usedQuestions.has(template.question.toLowerCase())
  );
  
  if (availablePuzzles.length === 0) return [];
  
  // Group by difficulty
  const byDifficulty = {
    easy: availablePuzzles.filter(p => p.difficulty === 'easy'),
    medium: availablePuzzles.filter(p => p.difficulty === 'medium'),
    hard: availablePuzzles.filter(p => p.difficulty === 'hard'),
    super_hard: availablePuzzles.filter(p => p.difficulty === 'super_hard')
  };
  
  const result: PuzzleTemplate[] = [];
  const targetDistribution = {
    easy: Math.ceil(count * 0.3),      // 30% easy
    medium: Math.ceil(count * 0.4),    // 40% medium  
    hard: Math.ceil(count * 0.2),      // 20% hard
    super_hard: Math.ceil(count * 0.1) // 10% super hard
  };
  
  // Add puzzles according to distribution
  Object.entries(targetDistribution).forEach(([difficulty, targetCount]) => {
    const available = byDifficulty[difficulty as keyof typeof byDifficulty];
    if (available.length > 0) {
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      result.push(...shuffled.slice(0, Math.min(targetCount, available.length)));
    }
  });
  
  // If we don't have enough, fill with random available puzzles
  if (result.length < count) {
    const remaining = availablePuzzles.filter(p => !result.includes(p));
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    result.push(...shuffled.slice(0, count - result.length));
  }
  
  return result.slice(0, count);
};

// Auto-generate puzzles for the current week
export const autoGeneratePuzzles = (existingPuzzles: any[], weekNumber: number, year: number): any[] => {
  const newPuzzles = generateBalancedPuzzles(existingPuzzles, 5);
  
  return newPuzzles.map((template, index) => ({
    id: `${Date.now()}_${index}`,
    question: template.question,
    answer: template.answer.toLowerCase().trim(),
    difficulty: template.difficulty,
    isActive: true,
    createdAt: new Date().toISOString(),
    weekNumber,
    year,
    category: template.category,
    autoGenerated: true
  }));
};