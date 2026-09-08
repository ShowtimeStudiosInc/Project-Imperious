import { useState, useEffect } from 'react';

interface MatchRequest {
  id: string;
  userId: string;
  username: string;
  preferences: {
    mode: string;
    levelCap: number;
    allowCustomAbilities: boolean;
    selectedCharacterId: string;
  };
}

interface Match {
  id: string;
  mode: string;
  status: string;
  participants: any[];
  rules: any;
}

export default function MatchLobby({ token, user, onMatchJoin }: { token: string; user: any; onMatchJoin: (match: Match) => void }) {
  const [availableMatches, setAvailableMatches] = useState<MatchRequest[]>([]);
  const [myMatchRequest, setMyMatchRequest] = useState<MatchRequest | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [userCharacters, setUserCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserCharacters();
    fetchAvailableMatches();
    const interval = setInterval(fetchAvailableMatches, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [token]);

  const fetchUserCharacters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/characters', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUserCharacters(data.characters || []);
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  const fetchAvailableMatches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/match/available', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAvailableMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const createMatchRequest = async () => {
    if (!selectedCharacter) {
      alert('Please select a character first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/match/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mode: 'PvP',
          levelCap: 30,
          allowCustomAbilities: true,
          selectedCharacterId: selectedCharacter
        })
      });
      const data = await response.json();
      if (data.success) {
        setMyMatchRequest(data.matchRequest);
      }
    } catch (error) {
      console.error('Error creating match request:', error);
      alert('Failed to create match request');
    } finally {
      setLoading(false);
    }
  };

  const joinMatch = async (matchId: string) => {
    if (!selectedCharacter) {
      alert('Please select a character first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/match/${matchId}/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ characterId: selectedCharacter })
      });
      const data = await response.json();
      if (data.success) {
        onMatchJoin(data.match);
      } else {
        alert(data.error || 'Failed to join match');
      }
    } catch (error) {
      console.error('Error joining match:', error);
      alert('Failed to join match');
    } finally {
      setLoading(false);
    }
  };

  const cancelMatchRequest = async () => {
    if (!myMatchRequest) return;

    try {
      const response = await fetch(`http://localhost:5000/api/match/${myMatchRequest.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMyMatchRequest(null);
      }
    } catch (error) {
      console.error('Error canceling match request:', error);
    }
  };

  return (
    <div className="match-lobby">
      <h2>Battle Lobby</h2>
      
      <div className="character-selection">
        <h3>Select Your Character</h3>
        <select 
          value={selectedCharacter} 
          onChange={(e) => setSelectedCharacter(e.target.value)}
        >
          <option value="">-- Select Character --</option>
          {userCharacters.map(char => (
            <option key={char.id} value={char.id}>
              {char.name} (LVL {char.stats?.LVL || 1})
            </option>
          ))}
        </select>
      </div>

      <div className="match-actions">
        {myMatchRequest ? (
          <div className="my-match-request">
            <p>Looking for opponent...</p>
            <button className="btn-secondary" onClick={cancelMatchRequest}>
              Cancel
            </button>
          </div>
        ) : (
          <button 
            className="btn-primary" 
            onClick={createMatchRequest}
            disabled={!selectedCharacter || loading}
          >
            {loading ? 'Creating...' : 'Find Match'}
          </button>
        )}
      </div>

      <div className="available-matches">
        <h3>Available Matches</h3>
        {availableMatches.length === 0 ? (
          <p>No matches available. Create a match request to find opponents!</p>
        ) : (
          <div className="match-list">
            {availableMatches.map(match => (
              <div key={match.id} className="match-card">
                <div className="match-info">
                  <h4>{match.username}</h4>
                  <p>Mode: {match.preferences.mode}</p>
                  <p>Level Cap: {match.preferences.levelCap}</p>
                  <p>Custom Abilities: {match.preferences.allowCustomAbilities ? 'Allowed' : 'Not Allowed'}</p>
                </div>
                <button 
                  className="btn-primary"
                  onClick={() => joinMatch(match.id)}
                  disabled={!selectedCharacter || loading}
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}