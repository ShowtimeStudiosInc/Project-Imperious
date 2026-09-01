import React, { useState, useEffect } from 'react'
import CharacterCreator from './components/CharacterCreator'
import AbilityBuilder from './components/AbilityBuilder'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import Profile from './components/Profile'
import MatchLobby from './components/MatchLobby'
import BattleArena from './components/BattleArena'
import './App.css'

interface User {
  id: string;
  username: string;
  email: string;
  profile: any;
}

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'register' | 'create' | 'abilities' | 'profile' | 'lobby' | 'battle'>('home')
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [currentMatch, setCurrentMatch] = useState<any>(null)

  useEffect(() => {
    // Check for existing session
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    setCurrentView('profile')
  }

  const handleRegister = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    setCurrentView('profile')
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    setCurrentView('home')
  }

  const handleMatchJoin = (match: any) => {
    setCurrentMatch(match)
    setCurrentView('battle')
  }

  const handleBattleEnd = () => {
    setCurrentMatch(null)
    setCurrentView('lobby')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo-container">
          <div className="logo-placeholder">⚔️</div>
        </div>
        <h1 className="title">Imperious Battle System</h1>
        <p className="subtitle">Turn-based combat in the Diamond Authorities</p>
      </header>

      <main className="main-content">
        {currentView === 'home' && (
          <>
            <div className="hero-section">
              <h2>Welcome to the Arena</h2>
              <p>Enter session code to join battle or create your own combat session</p>
              
              <div className="session-controls">
                <div className="input-group">
                  <input 
                    type="text" 
                    placeholder="Enter session code..." 
                    className="session-input"
                  />
                  <button className="btn-primary">Join Battle</button>
                </div>
                <button className="btn-secondary">Create New Session</button>
              </div>
              
              <div className="quick-actions">
                {user ? (
                  <>
                    <button className="btn-secondary" onClick={() => setCurrentView('create')}>
                      Create Character
                    </button>
                    <button className="btn-secondary" onClick={() => setCurrentView('abilities')}>
                      Build Abilities
                    </button>
                    <button className="btn-secondary" onClick={() => setCurrentView('lobby')}>
                      Battle Lobby
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-secondary" onClick={() => setCurrentView('login')}>
                      Login
                    </button>
                    <button className="btn-secondary" onClick={() => setCurrentView('register')}>
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="battle-modes">
              <h3>Battle Modes</h3>
              <div className="mode-grid">
                <div className="mode-card">
                  <div className="mode-icon">🤖</div>
                  <h4>Player vs AI</h4>
                  <p>Challenge computer-controlled enemies</p>
                </div>
                <div className="mode-card">
                  <div className="mode-icon">⚔️</div>
                  <h4>Player vs Player</h4>
                  <p>Combat against other players</p>
                </div>
                <div className="mode-card">
                  <div className="mode-icon">🏆</div>
                  <h4>Tournament</h4>
                  <p>Compete in organized competitions</p>
                </div>
                <div className="mode-card">
                  <div className="mode-icon">🎯</div>
                  <h4>Sandbox</h4>
                  <p>Practice and test your builds</p>
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === 'create' && user && (
          <div className="creator-section">
            <button className="btn-back" onClick={() => setCurrentView('profile')}>
              ← Back to Profile
            </button>
            <CharacterCreator userId={user.id} token={token || ''} />
          </div>
        )}

        {currentView === 'abilities' && user && (
          <div className="abilities-section">
            <button className="btn-back" onClick={() => setCurrentView('profile')}>
              ← Back to Profile
            </button>
            <AbilityBuilder token={token || ''} />
          </div>
        )}

        {currentView === 'login' && (
          <div className="auth-section">
            <button className="btn-back" onClick={() => setCurrentView('home')}>
              ← Back to Home
            </button>
            <LoginForm onLogin={handleLogin} />
          </div>
        )}

        {currentView === 'register' && (
          <div className="auth-section">
            <button className="btn-back" onClick={() => setCurrentView('home')}>
              ← Back to Home
            </button>
            <RegisterForm onRegister={handleRegister} />
          </div>
        )}

        {currentView === 'profile' && user && (
          <div className="profile-section">
            <Profile user={user} onLogout={handleLogout} />
          </div>
        )}

        {currentView === 'lobby' && user && (
          <div className="lobby-section">
            <button className="btn-back" onClick={() => setCurrentView('profile')}>
              ← Back to Profile
            </button>
            <MatchLobby token={token || ''} user={user} onMatchJoin={handleMatchJoin} />
          </div>
        )}

        {currentView === 'battle' && user && currentMatch && (
          <div className="battle-section">
            <BattleArena token={token || ''} match={currentMatch} user={user} onBattleEnd={handleBattleEnd} />
          </div>
        )}

        {currentView === 'battle' && (
          <div className="battle-section">
            <button className="btn-back" onClick={() => setCurrentView('home')}>
              ← Back to Home
            </button>
            <h2>Battle Arena</h2>
            <p>Battle interface coming soon...</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App