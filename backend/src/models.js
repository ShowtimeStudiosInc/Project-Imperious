// Simple in-memory data models (replace with MongoDB in production)

class UserModel {
  constructor() {
    this.users = new Map();
  }

  create(userData) {
    const user = {
      id: this.generateId(),
      username: userData.username,
      email: userData.email,
      passwordHash: userData.passwordHash,
      profile: {
        avatar: null,
        bio: null,
        createdAt: new Date()
      },
      characters: [],
      battleHistory: [],
      friends: [],
      settings: {
        privacy: 'public',
        notifications: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.id, user);
    return user;
  }

  findById(id) {
    return this.users.get(id);
  }

  findByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  findByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  update(id, updates) {
    const user = this.users.get(id);
    if (!user) return null;

    Object.assign(user, updates);
    user.updatedAt = new Date();
    this.users.set(id, user);
    return user;
  }

  addCharacter(userId, characterId) {
    const user = this.users.get(userId);
    if (!user) return null;

    if (!user.characters.includes(characterId)) {
      user.characters.push(characterId);
      user.updatedAt = new Date();
      this.users.set(userId, user);
    }
    return user;
  }

  removeCharacter(userId, characterId) {
    const user = this.users.get(userId);
    if (!user) return null;

    user.characters = user.characters.filter(id => id !== characterId);
    user.updatedAt = new Date();
    this.users.set(userId, user);
    return user;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  getAll() {
    return Array.from(this.users.values());
  }
}

class CharacterModel {
  constructor() {
    this.characters = new Map();
  }

  create(characterData) {
    const character = {
      id: this.generateId(),
      ownerId: characterData.ownerId,
      name: characterData.name,
      type: characterData.type,
      gemType: characterData.gemType,
      facet: characterData.facet,
      cut: characterData.cut,
      era: characterData.era,
      age: characterData.age,
      adult: characterData.adult,
      personality: characterData.personality,
      likes: characterData.likes,
      dislikes: characterData.dislikes,
      relationships: characterData.relationships,
      fear: characterData.fear,
      alignment: characterData.alignment,
      stats: characterData.stats,
      weapon: characterData.weapon,
      armor: characterData.armor,
      accessories: characterData.accessories,
      abilities: characterData.abilities || [],
      naturalHeight: characterData.naturalHeight,
      appearance: characterData.appearance,
      isPublic: characterData.isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.characters.set(character.id, character);
    return character;
  }

  findById(id) {
    return this.characters.get(id);
  }

  findByOwner(ownerId) {
    const ownerCharacters = [];
    for (const character of this.characters.values()) {
      if (character.ownerId === ownerId) {
        ownerCharacters.push(character);
      }
    }
    return ownerCharacters;
  }

  update(id, updates) {
    const character = this.characters.get(id);
    if (!character) return null;

    Object.assign(character, updates);
    character.updatedAt = new Date();
    this.characters.set(id, character);
    return character;
  }

  delete(id) {
    return this.characters.delete(id);
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  getAll() {
    return Array.from(this.characters.values());
  }
}

// Create global instances
const userModel = new UserModel();
const characterModel = new CharacterModel();

// Make them globally accessible
global.userModel = userModel;
global.characterModel = characterModel;

module.exports = {
  UserModel,
  CharacterModel,
  userModel,
  characterModel
};