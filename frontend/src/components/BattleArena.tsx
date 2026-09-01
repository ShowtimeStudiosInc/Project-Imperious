import React, { useState, useEffect } from 'react';

interface Participant {
  userId: string;
  username: string;
  selectedCharacterId: string;
  team: string;
  ready: boolean;
  character?: any;
  currentHP: number;
  starPoints: number;
}

interface BattleArenaProps {
  token: string;
  match: any;
  user: any;
  onBattleEnd: () => void;
}

export default function BattleArena({ token, match, user, onBattleEnd }: BattleArenaProps) {
  const [currentTurn, setCurrentTurn] = useState(0);
  const [starGauge, setStarGauge] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [selectedAbility, setSelectedAbility] = useState('');

  useEffect(() => {
    // Set up WebSocket connection for real-time battle updates
    // This would connect to the Socket.io server
    const setupBattleConnection = () => {
      // Socket.io connection logic here
      console.log('Setting up battle connection for match:', match.id);
    };

    setupBattleConnection();
  }, [match.id]);

  const participant = match.participants.find((p: Participant) => p.userId === user.id);
  const opponent = match.participants.find((p: Participant) => p.userId !== user.id);

  const handleReady = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/match/${match.id}/ready`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        console.log('Ready status set');
      }
    } catch (error) {
      console.error('Error setting ready:', error);
    }
  };

  const useAbility = (abilityId: string) => {
    const cost = 3; // Example cost
    if (availablePoints < cost) {
      alert('Not enough Star Points!');
      return;
    }

    // Add to battle log
    setBattleLog(prev => [...prev, `${user.username} used an ability!`]);
    
    // Update star gauge (simulated)
    setStarGauge(prev => Math.min(100, prev + 15));
    setAvailablePoints(prev => Math.max(0, prev - cost));
  };

  const startBattle = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/match/${match.id}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        console.log('Battle started');
      }
    } catch (error) {
      console.error('Error starting battle:', error);
    }
  };

  return (
    <div className="battle-arena">
      <div className="battle-header">
        <h2>Battle Arena</h2>
        <button className="btn-secondary" onClick={onBattleEnd}>
          Leave Battle
        </button>
      </div>

      <div className="battle-status">
        <div className="status-bar">
          <span>Match Status: {match.status}</span>
          <span>Round: {match.battleState?.round || 1}</span>
        </div>
        <div className="star-gauge">
          <span>Star Gauge: {starGauge}/100</span>
          <span>Available Points: {availablePoints}</span>
        </div>
      </div>

      <div className="participants">
        <div className="participant-card you">
          <h3>{participant?.username} (You)</h3>
          {participant?.character && (
            <div className="character-display">
              <h4>{participant.character.name}</h4>
              <div className="stats">
                <span>HP: {participant.currentHP}/{participant.character.stats.MAX_HP}</span>
                <span>ATK: {participant.character.stats.ATK}</span>
                <span>DEF: {participant.character.stats.DEF}</span>
              </div>
            </div>
          )}
          <div className="ready-status">
            {participant?.ready ? '✓ Ready' : '○ Not Ready'}
          </div>
          {!participant?.ready && (
            <button className="btn-primary" onClick={handleReady}>
              Ready Up
            </button>
          )}
        </div>

        <div className="vs-divider">VS</div>

        <div className="participant-card opponent">
          <h3>{opponent?.username}</h3>
          {opponent?.character && (
            <div className="character-display">
              <h4>{opponent.character.name}</h4>
              <div className="stats">
                <span>HP: {opponent.currentHP}/{opponent.character.stats.MAX_HP}</span>
                <span>ATK: {opponent.character.stats.ATK}</span>
                <span>DEF: {opponent.character.stats.DEF}</span>
              </div>
            </div>
          )}
          <div className="ready-status">
            {opponent?.ready ? '✓ Ready' : '○ Not Ready'}
          </div>
        </div>
      </div>

      {match.status === 'PREPARING' && match.participants.every((p: Participant) => p.ready) && (
        <div className="battle-start">
          <button className="btn-primary" onClick={startBattle}>
            Start Battle
          </button>
        </div>
      )}

      {match.status === 'IN_PROGRESS' && (
        <div className="battle-actions">
          <h3>Your Turn</h3>
          <div className="ability-selector">
            <h4>Abilities</h4>
            <div className="ability-list">
              {participant?.character?.abilities?.map((ability: any) => (
                <button 
                  key={ability.id}
                  className="ability-btn"
                  onClick={() => useAbility(ability.id)}
                >
                  {ability.name} (3 SP)
                </button>
              ))}
            </div>
          </div>
          <div className="basic-actions">
            <button className="btn-secondary">Basic Attack</button>
            <button className="btn-secondary">Defend</button>
            <button className="btn-secondary">Item</button>
          </div>
        </div>
      )}

      <div className="battle-log">
        <h3>Battle Log</h3>
        <div className="log-entries">
          {battleLog.length === 0 ? (
            <p>Battle log will appear here...</p>
          ) : (
            battleLog.map((entry, index) => (
              <p key={index}>{entry}</p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
