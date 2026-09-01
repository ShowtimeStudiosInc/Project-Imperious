const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const {
  StarPointSystem,
  CharacterStats,
  BattleCalculator,
  createGemCharacter,
  createOrganicCharacter,
  generateId
} = require('./combatLogic');

const {
  AbilityBuilder,
  AbilityExecutor
} = require('./abilityBuilder');

const AuthService = require('./auth');
const { userModel, characterModel } = require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
const battleSessions = new Map();
const abilities = new Map();

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Battle System API is running' });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!AuthService.validateUsername(username)) {
      return res.status(400).json({ error: 'Invalid username (3-20 characters, alphanumeric only)' });
    }
    if (!AuthService.validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (!AuthService.validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    if (userModel.findByUsername(username)) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    if (userModel.findByEmail(email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password and create user
    const passwordHash = await AuthService.hashPassword(password);
    const user = userModel.create({
      username,
      email,
      passwordHash
    });

    // Generate token
    const token = AuthService.generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = userModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await AuthService.comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = AuthService.generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', AuthService.authMiddleware, (req, res) => {
  const user = userModel.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    profile: user.profile,
    characters: user.characters,
    battleHistory: user.battleHistory,
    friends: user.friends,
    settings: user.settings
  });
});

app.put('/api/auth/profile', AuthService.authMiddleware, (req, res) => {
  try {
    const { bio, avatar } = req.body;
    const user = userModel.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = {};
    if (bio !== undefined) updates.profile = { ...user.profile, bio };
    if (avatar !== undefined) updates.profile = { ...user.profile, avatar };

    const updatedUser = userModel.update(req.userId, updates);

    res.json({
      success: true,
      profile: updatedUser.profile
    });
  } catch (error) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Session code generation
app.post('/api/sessions/create', (req, res) => {
  const charPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sessionCode = '';
  for (let i = 0; i < 6; i++) {
    sessionCode += charPool.charAt(Math.floor(Math.random() * charPool.length));
  }
  
  const session = {
    sessionId: sessionCode,
    mode: req.body.mode || 'PvAI',
    status: 'WAITING',
    host: req.body.hostId || generateId(),
    participants: [],
    battleState: {
      turnOrder: [],
      currentTurn: 0,
      round: 1,
      starGauge: 0,
      battleLog: []
    },
    starPointSystem: new StarPointSystem(),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };
  
  battleSessions.set(sessionCode, session);
  
  res.json({
    sessionId: sessionCode,
    status: 'WAITING',
    createdAt: session.createdAt,
    expiresAt: session.expiresAt
  });
});

// Get session details
app.get('/api/sessions/:code', (req, res) => {
  const session = battleSessions.get(req.params.code);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// Join session
app.post('/api/sessions/:code/join', (req, res) => {
  const session = battleSessions.get(req.params.code);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  if (session.status !== 'WAITING') {
    return res.status(400).json({ error: 'Session is not accepting new participants' });
  }
  
  const participant = {
    userId: req.body.userId || generateId(),
    character: req.body.character,
    team: req.body.team || 'team1',
    currentHP: req.body.character?.stats?.MAX_HP || req.body.character?.stats?.HP || 100,
    starPoints: 0
  };
  
  session.participants.push(participant);
  res.json({ success: true, participant });
});

// Create character
app.post('/api/characters/create', AuthService.authMiddleware, (req, res) => {
  try {
    let character;
    if (req.body.type === 'Gem') {
      character = createGemCharacter(req.body);
    } else {
      character = createOrganicCharacter(req.body);
    }
    
    // Add owner ID
    character.ownerId = req.userId;
    
    // Save to character model
    const savedCharacter = characterModel.create(character);
    
    // Add to user's character list
    userModel.addCharacter(req.userId, savedCharacter.id);
    
    res.json({ success: true, character: savedCharacter });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's characters
app.get('/api/characters', AuthService.authMiddleware, (req, res) => {
  const userCharacters = characterModel.findByOwner(req.userId);
  res.json({ characters: userCharacters });
});

// Get specific character
app.get('/api/characters/:id', AuthService.authMiddleware, (req, res) => {
  const character = characterModel.findById(req.params.id);
  if (!character) {
    return res.status(404).json({ error: 'Character not found' });
  }
  
  // Check if user owns this character
  if (character.ownerId !== req.userId && !character.isPublic) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  res.json(character);
});

// Update character
app.put('/api/characters/:id', AuthService.authMiddleware, (req, res) => {
  try {
    const character = characterModel.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Check ownership
    if (character.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updatedCharacter = characterModel.update(req.params.id, req.body);
    res.json({ success: true, character: updatedCharacter });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete character
app.delete('/api/characters/:id', AuthService.authMiddleware, (req, res) => {
  try {
    const character = characterModel.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Check ownership
    if (character.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    characterModel.delete(req.params.id);
    userModel.removeCharacter(req.userId, req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Calculate damage
app.post('/api/battle/calculate-damage', (req, res) => {
  try {
    const { attacker, defender, ability } = req.body;
    const damage = BattleCalculator.calculateDamage(attacker, defender, ability);
    res.json({ damage });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Calculate turn order
app.post('/api/battle/turn-order', (req, res) => {
  try {
    const { characters: charList } = req.body;
    const turnOrder = BattleCalculator.calculateTurnOrder(charList);
    res.json({ turnOrder });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Check ability usage
app.post('/api/battle/check-ability', (req, res) => {
  try {
    const { sessionId, ability } = req.body;
    const session = battleSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const canUse = session.starPointSystem.canUseAbility(ability);
    const availablePoints = session.starPointSystem.getAvailablePoints();
    
    res.json({ canUse, availablePoints, requiredPoints: ability.starPointCost });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Level up character
app.post('/api/characters/:id/levelup', AuthService.authMiddleware, (req, res) => {
  try {
    const character = characterModel.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Check ownership
    if (character.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const newLevel = req.body.newLevel;
    const charStats = new CharacterStats(character.stats, character.type);
    const gains = charStats.calculateLevelUp(newLevel);
    
    if (!gains) {
      return res.status(400).json({ error: 'Invalid level up' });
    }
    
    charStats.applyStatGains(gains);
    character.stats = charStats.stats;
    character.stats.LVL = newLevel;
    
    const updatedCharacter = characterModel.update(req.params.id, character);
    
    res.json({ success: true, gains, newStats: updatedCharacter.stats });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add EXP to character
app.post('/api/characters/:id/add-exp', AuthService.authMiddleware, (req, res) => {
  try {
    const character = characterModel.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Check ownership
    if (character.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const expToAdd = req.body.exp;
    character.stats.EXP += expToAdd;
    
    const charStats = new CharacterStats(character.stats, character.type);
    const canLevelUp = charStats.checkLevelUp();
    
    const updatedCharacter = characterModel.update(req.params.id, character);
    
    res.json({ 
      success: true, 
      newExp: updatedCharacter.stats.EXP, 
      canLevelUp,
      nextLevelExp: charStats.getExpRequiredForLevel(updatedCharacter.stats.LVL + 1)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ability Builder Endpoints
app.post('/api/abilities/test-formula', AuthService.authMiddleware, (req, res) => {
  try {
    const { formula, testStats } = req.body;
    const damage = AbilityBuilder.parseDamageFormula(formula, testStats);
    res.json({ success: true, damage });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/abilities/validate', AuthService.authMiddleware, (req, res) => {
  try {
    const validation = AbilityBuilder.validateAbility(req.body);
    res.json(validation);
  } catch (error) {
    res.status(400).json({ isValid: false, errors: [error.message] });
  }
});

app.post('/api/abilities/suggest-cost', AuthService.authMiddleware, (req, res) => {
  try {
    const suggestedCost = AbilityBuilder.calculateAbilityCost(req.body);
    res.json({ success: true, suggestedCost });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/abilities/create', AuthService.authMiddleware, (req, res) => {
  try {
    const validation = AbilityBuilder.validateAbility(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }
    
    const ability = {
      id: generateId(),
      ...req.body,
      createdBy: req.userId,
      createdAt: new Date()
    };
    
    // Store ability (in production, save to database)
    abilities.set(ability.id, ability);
    
    res.json({ success: true, ability });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/abilities/:id', AuthService.authMiddleware, (req, res) => {
  const ability = abilities.get(req.params.id);
  if (!ability) {
    return res.status(404).json({ error: 'Ability not found' });
  }
  res.json(ability);
});

app.get('/api/abilities', AuthService.authMiddleware, (req, res) => {
  const userAbilities = Array.from(abilities.values()).filter(
    ability => ability.createdBy === req.userId || ability.isPublic
  );
  res.json({ abilities: userAbilities });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_session', (data) => {
    console.log('User joining session:', data);
    const session = battleSessions.get(data.sessionId);
    if (session) {
      socket.join(data.sessionId);
      io.to(data.sessionId).emit('user_joined', {
        userId: socket.id,
        sessionId: data.sessionId,
        participants: session.participants
      });
    }
  });

  socket.on('battle_action', (data) => {
    console.log('Battle action received:', data);
    const session = battleSessions.get(data.sessionId);
    if (session) {
      // Add Star Points to gauge
      session.starPointSystem.addGauge(10); // Add 10 to gauge per action
      
      io.to(data.sessionId).emit('action_result', {
        ...data,
        starGauge: session.starPointSystem.starGauge,
        availablePoints: session.starPointSystem.getAvailablePoints()
      });
    }
  });

  socket.on('spend_star_points', (data) => {
    console.log('Spending star points:', data);
    const session = battleSessions.get(data.sessionId);
    if (session) {
      const success = session.starPointSystem.spendPoints(data.amount);
      io.to(data.sessionId).emit('points_spent', {
        success,
        availablePoints: session.starPointSystem.getAvailablePoints(),
        starGauge: session.starPointSystem.starGauge
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Battle System server running on port ${PORT}`);
});