/**
 * Anti-cheat service for monitoring duels
 */

class AntiCheatService {
  constructor() {
    // We could store warnings in memory or redis, but returning the event is enough for now
  }

  analyzeEvent(playerId, matchId, eventType, eventData) {
    let penalty = 0;
    let warning = null;
    let isFlagged = false;

    switch (eventType) {
      case "tab_switch":
        warning = "Tab switched during match!";
        isFlagged = true;
        // Optionally penalize specific score amount if needed
        break;
      case "paste":
        if (eventData?.pastedText?.length > 50) {
          warning = "Large paste detected!";
          isFlagged = true;
        }
        break;
      // other heuristics
    }

    return { penalty, warning, isFlagged };
  }
}

export default new AntiCheatService();
