/**
 * Core scoring logic for duels
 */

export const getBasePoints = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return 100;
    case "medium":
      return 200;
    case "hard":
      return 300;
    default:
      return 100;
  }
};

export const calculateSubmissionPoints = (
  difficulty,
  isFirstSolver,
  isCorrect,
  minutesElapsed,
  wrongAttemptsCount
) => {
  if (!isCorrect) {
    return -20;
  }

  let points = getBasePoints(difficulty);
  
  if (isFirstSolver) {
    points += 50;
  }
  
  // Time penalty: -2 per minute elapsed
  const timePenalty = minutesElapsed * 2;
  points = Math.max(10, points - timePenalty); // Ensure they don't lose all points for taking too long if correct
  
  // Clean solve bonus
  if (wrongAttemptsCount === 0) {
    points += 30;
  }

  return points;
};
