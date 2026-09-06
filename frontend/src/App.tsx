import React, { useState, useEffect } from 'react'
import CharacterCreator from './components/CharacterCreator'
import AbilityBuilder from './components/AbilityBuilder'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import Profile from './components/Profile'
import MatchLobby from './components/MatchLobby'
import BattleArena from './components/BattleArena'
import './index.css'

interface User {
  id: string;
  username: string;
  email: string;
  profile: any;
}

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'home' | 'create' | 'abilities' | 'profile' | 'lobby' | 'battle'>('login')
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
      setCurrentView('home')
    }
  }, [])

  const handleLogin = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    setCurrentView('home')
  }

  const handleRegister = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    setCurrentView('home')
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
      {!user ? (
        // Login/Register Landing Page
        <div className="landing-page">
          <div className="landing-content">
            <div className="logo-container">
              <div className="logo-placeholder">⚔️</div>
            </div>
            <h1 className="landing-title">Imperious Battle System</h1>
            <p className="landing-subtitle">Turn-based combat in the Diamond Authorities</p>
            
            <div className="auth-container">
              {currentView === 'login' ? (
                <LoginForm onLogin={handleLogin} />
              ) : (
                <RegisterForm onRegister={handleRegister} />
              )}
              
              <div className="auth-toggle">
                {currentView === 'login' ? (
                  <p>Don't have an account? <button onClick={() => setCurrentView('register')}>Sign up</button></p>
                ) : (
                  <p>Already have an account? <button onClick={() => setCurrentView('login')}>Log in</button></p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Main Application with Navigation
        <div className="app-with-nav">
          <nav className="main-nav">
            <div className="nav-brand">
              <div className="nav-logo">⚔️</div>
              <span className="nav-title">Imperious Battle</span>
            </div>
            <ul className="nav-menu">
              <li className={currentView === 'home' ? 'active' : ''}>
                <button onClick={() => setCurrentView('home')}>Home</button>
              </li>
              <li className={currentView === 'create' ? 'active' : ''}>
                <button onClick={() => setCurrentView('create')}>Characters</button>
              </li>
              <li className={currentView === 'abilities' ? 'active' : ''}>
                <button onClick={() => setCurrentView('abilities')}>Abilities</button>
              </li>
              <li className={currentView === 'lobby' ? 'active' : ''}>
                <button onClick={() => setCurrentView('lobby')}>Battle Lobby</button>
              </li>
              <li className={currentView === 'profile' ? 'active' : ''}>
                <button onClick={() => setCurrentView('profile')}>Profile</button>
              </li>
            </ul>
            <div className="nav-user">
              <span className="nav-username">{user.username}</span>
              <button className="nav-logout" onClick={handleLogout}>Logout</button>
            </div>
          </nav>

          <main className="main-content">
            {currentView === 'home' && (
              <div className="home-section">
                <h2>Welcome to the Arena, {user.username}!</h2>
                <div className="feature-grid">
                  <div className="feature-card" onClick={() => setCurrentView('create')}>
                    <div className="feature-icon">👤</div>
                    <h3>Create Characters</h3>
                    <p>Build your gem roster for battle</p>
                  </div>
                  <div className="feature-card" onClick={() => setCurrentView('abilities')}>
                    <div className="feature-icon">⚡</div>
                    <h3>Build Abilities</h3>
                    <p>Create custom moves and attacks</p>
                  </div>
                  <div className="feature-card" onClick={() => setCurrentView('lobby')}>
                    <div className="feature-icon">⚔️</div>
                    <h3>Battle Lobby</h3>
                    <p>Find opponents and fight</p>
                  </div>
                  <div className="feature-card" onClick={() => setCurrentView('profile')}>
                    <div className="feature-icon">👤</div>
                    <h3>Your Profile</h3>
                    <p>View your stats and history</p>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'create' && (
              <div className="section-content">
                <CharacterCreator userId={user.id} token={token || ''} />
              </div>
            )}

            {currentView === 'abilities' && (
              <div className="section-content">
                <AbilityBuilder token={token || ''} />
              </div>
            )}

            {currentView === 'lobby' && (
              <div className="section-content">
                <MatchLobby token={token || ''} user={user} onMatchJoin={handleMatchJoin} />
              </div>
            )}

            {currentView === 'profile' && (
              <div className="section-content">
                <Profile user={user} onLogout={handleLogout} />
              </div>
            )}

            {currentView === 'battle' && currentMatch && (
              <div className="section-content">
                <BattleArena token={token || ''} match={currentMatch} user={user} onBattleEnd={handleBattleEnd} />
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default App