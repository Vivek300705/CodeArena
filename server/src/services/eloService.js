/**
 * ELO calculation logic
 */

const K_FACTOR = 32;

export const calculateEloChange = (ratingA, ratingB, scoreA, scoreB) => {
  // Expected scores
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));

  let actualA = 0.5; // Draw
  let actualB = 0.5;

  if (scoreA > scoreB) {
    actualA = 1;
    actualB = 0;
  } else if (scoreB > scoreA) {
    actualA = 0;
    actualB = 1;
  }

  const changeA = Math.round(K_FACTOR * (actualA - expectedA));
  const changeB = Math.round(K_FACTOR * (actualB - expectedB));

  return { changeA, changeB };
};
