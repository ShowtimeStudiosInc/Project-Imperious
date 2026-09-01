// Matchmaking and Battle Setup System

class Matchmaker {
  constructor() {
    this.availableMatches = new Map(); // Players looking for matches
    this.activeMatches = new Map(); // Battles in progress
  }

  createMatchRequest(userId, username, preferences) {
    const matchRequest = {
      id: this.generateId(),
      userId,
      username,
      preferences: {
        mode: preferences.mode || 'PvP',
        levelCap: preferences.levelCap || 30,
        allowCustomAbilities: preferences.allowCustomAbilities !== false,
        selectedCharacterId: preferences.selectedCharacterId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      }
    };

    this.availableMatches.set(matchRequest.id, matchRequest);
    return matchRequest;
  }

  findMatch(userId, preferences) {
    // Find compatible match requests
    for (const [matchId, request] of this.availableMatches) {
      if (request.userId === userId) continue; // Skip own requests
      if (new Date() > request.expiresAt) continue; // Skip expired requests

      // Check compatibility
      if (this.isCompatible(request.preferences, preferences)) {
        // Remove from available and create active match
        this.availableMatches.delete(matchId);
        return this.createActiveMatch(request, { userId, preferences });
      }
    }

    // No compatible match found
    return null;
  }

  isCompatible(prefs1, prefs2) {
    // Check if preferences are compatible
    if (prefs1.mode !== prefs2.mode) return false;
    if (prefs1.levelCap !== prefs2.levelCap) return false;
    if (prefs1.allowCustomAbilities !== prefs2.allowCustomAbilities) return false;
    return true;
  }

  createActiveMatch(request1, request2) {
    const match = {
      id: this.generateId(),
      mode: request1.preferences.mode,
      status: 'WAITING',
      participants: [
        {
          userId: request1.userId,
          username: request1.username,
          selectedCharacterId: request1.preferences.selectedCharacterId,
          team: 'team1',
          ready: false
        },
        {
          userId: request2.userId,
          username: request2.username,
          selectedCharacterId: request2.preferences.selectedCharacterId,
          team: 'team2',
          ready: false
        }
      ],
      rules: {
        levelCap: request1.preferences.levelCap,
        allowCustomAbilities: request1.preferences.allowCustomAbilities
      },
      battleState: {
        turnOrder: [],
        currentTurn: 0,
        round: 1,
        starGauge: 0,
        battleLog: []
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    this.activeMatches.set(match.id, match);
    return match;
  }

  getMatch(matchId) {
    return this.activeMatches.get(matchId);
  }

  joinMatch(matchId, userId, characterId) {
    const match = this.activeMatches.get(matchId);
    if (!match) return null;

    // Check if match is accepting players
    if (match.status !== 'WAITING') return null;
    if (match.participants.length >= 2) return null;

    // Add participant
    match.participants.push({
      userId,
      selectedCharacterId: characterId,
      team: match.participants.length === 0 ? 'team1' : 'team2',
      ready: false
    });

    this.activeMatches.set(matchId, match);
    return match;
  }

  setPlayerReady(matchId, userId) {
    const match = this.activeMatches.get(matchId);
    if (!match) return null;

    const participant = match.participants.find(p => p.userId === userId);
    if (!participant) return null;

    participant.ready = true;

    // Check if all players are ready
    const allReady = match.participants.every(p => p.ready);
    if (allReady && match.participants.length >= 2) {
      match.status = 'PREPARING';
    }

    this.activeMatches.set(matchId, match);
    return match;
  }

  startMatch(matchId, characterData) {
    const match = this.activeMatches.get(matchId);
    if (!match) return null;

    // Load character data for participants
    const participantsWithData = match.participants.map(p => ({
      ...p,
      character: characterData[p.selectedCharacterId],
      currentHP: characterData[p.selectedCharacterId]?.stats?.MAX_HP || 100,
      starPoints: 0
    }));

    // Calculate turn order
    const { BattleCalculator } = require('./combatLogic');
    const characters = participantsWithData.map(p => p.character);
    const turnOrder = BattleCalculator.calculateTurnOrder(characters);

    match.participants = participantsWithData;
    match.battleState.turnOrder = turnOrder.map(c => c.id);
    match.battleState.currentTurn = 0;
    match.status = 'IN_PROGRESS';

    this.activeMatches.set(matchId, match);
    return match;
  }

  cancelMatch(matchId, userId) {
    const match = this.activeMatches.get(matchId);
    if (!match) return false;

    // Only allow host or if match hasn't started
    if (match.status === 'IN_PROGRESS') return false;

    this.activeMatches.delete(matchId);
    return true;
  }

  endMatch(matchId, winner, battleLog) {
    const match = this.activeMatches.get(matchId);
    if (!match) return null;

    match.status = 'COMPLETED';
    match.winner = winner;
    match.battleState.battleLog = battleLog;
    match.completedAt = new Date();

    this.activeMatches.set(matchId, match);
    return match;
  }

  removeExpiredRequests() {
    const now = new Date();
    for (const [matchId, request] of this.availableMatches) {
      if (now > request.expiresAt) {
        this.availableMatches.delete(matchId);
      }
    }
  }

  getAvailableMatches() {
    this.removeExpiredRequests();
    return Array.from(this.availableMatches.values());
  }

  getActiveMatches() {
    return Array.from(this.activeMatches.values());
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

module.exports = Matchmaker;