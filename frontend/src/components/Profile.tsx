import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  profile: {
    avatar?: string;
    bio?: string;
    createdAt: string;
  };
  characters: string[];
  battleHistory: any[];
  friends: string[];
  settings: {
    privacy: string;
    notifications: boolean;
  };
}

export default function Profile({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const [userCharacters, setUserCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserCharacters();
    }
  }, [user]);

  const fetchUserCharacters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/characters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUserCharacters(data.characters || []);
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  if (!user) {
    return <div className="profile">Please log in to view your profile</div>;
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.profile.avatar ? (
            <img src={user.profile.avatar} alt={user.username} />
          ) : (
            <div className="avatar-placeholder">{user.username[0].toUpperCase()}</div>
          )}
        </div>
        <div className="profile-info">
          <h2>{user.username}</h2>
          <p className="email">{user.email}</p>
          {user.profile.bio && <p className="bio">{user.profile.bio}</p>}
          <p className="joined">Joined: {new Date(user.profile.createdAt).toLocaleDateString()}</p>
        </div>
        <button className="btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <h3>{userCharacters.length}</h3>
          <p>Characters</p>
        </div>
        <div className="stat-card">
          <h3>{user.battleHistory.length}</h3>
          <p>Battles</p>
        </div>
        <div className="stat-card">
          <h3>{user.friends.length}</h3>
          <p>Friends</p>
        </div>
      </div>

      <div className="character-roster">
        <h3>My Characters</h3>
        {loading ? (
          <p>Loading characters...</p>
        ) : userCharacters.length === 0 ? (
          <p>No characters yet. Create your first character!</p>
        ) : (
          <div className="character-grid">
            {userCharacters.map(character => (
              <div key={character.id} className="character-card">
                <h4>{character.name}</h4>
                <p>Type: {character.type}</p>
                {character.gemType && <p>Gem: {character.gemType}</p>}
                <p>Level: {character.stats?.LVL || 1}</p>
                <div className="character-stats">
                  <span>HP: {character.stats?.HP || 0}</span>
                  <span>ATK: {character.stats?.ATK || 0}</span>
                  <span>DEF: {character.stats?.DEF || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}