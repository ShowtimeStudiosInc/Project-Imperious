// Combat mechanics based on the established stat system

class StarPointSystem {
  constructor() {
    this.starGauge = 0;
    this.MAX_GAUGE = 100;
    this.POINTS_PER_FILL = 5;
  }

  addGauge(amount) {
    this.starGauge = Math.min(this.MAX_GAUGE, this.starGauge + amount);
  }

  getAvailablePoints() {
    return Math.floor(this.starGauge / (this.MAX_GAUGE / this.POINTS_PER_FILL));
  }

  spendPoints(amount) {
    const available = this.getAvailablePoints();
    if (available >= amount) {
      this.starGauge -= amount * (this.MAX_GAUGE / this.POINTS_PER_FILL);
      return true;
    }
    return false;
  }

  canUseAbility(ability) {
    return this.getAvailablePoints() >= ability.starPointCost;
  }

  reset() {
    this.starGauge = 0;
  }
}

class CharacterStats {
  constructor(baseStats, type = 'Organic') {
    this.type = type;
    this.stats = { ...baseStats };
  }

  calculateLevelUp(newLevel) {
    const currentLevel = this.stats.LVL;
    if (newLevel <= currentLevel || newLevel > 30) {
      return null; // Invalid level up
    }

    const levelsGained = newLevel - currentLevel;
    const gains = {};

    // HP: +4 per level
    gains.HP = levelsGained * 4;
    gains.MAX_HP = levelsGained * 4;

    // ATK: +2 per level
    gains.ATK = levelsGained * 2;

    // DEF: +1 every 2 levels
    gains.DEF = Math.floor(levelsGained / 2);

    // SPD: +1 every 4 levels
    gains.SPD = Math.floor(levelsGained / 4);

    // MAG: +2 for organics, +4 for Gems per level
    gains.MAG = levelsGained * (this.type === 'Gem' ? 4 : 2);

    // INT never increases
    gains.INT = 0;

    return gains;
  }

  applyStatGains(gains) {
    if (!gains) return false;

    for (const stat in gains) {
      if (this.stats.hasOwnProperty(stat)) {
        this.stats[stat] += gains[stat];
      }
    }
    return true;
  }

  getExpRequiredForLevel(level) {
    if (level <= 1) return 0;
    return 100 + (level - 2) * 25;
  }

  checkLevelUp() {
    const requiredExp = this.getExpRequiredForLevel(this.stats.LVL + 1);
    if (this.stats.EXP >= requiredExp && this.stats.LVL < 30) {
      return true;
    }
    return false;
  }

  getRunningSpeed() {
    // Running speed in km/h = SPD × 3
    return this.stats.SPD * 3;
  }
}

class BattleCalculator {
  static calculateDamage(attacker, defender, ability) {
    let baseDamage;

    if (ability.type === 'attack') {
      if (ability.damage) {
        baseDamage = ability.damage;
      } else {
        // Physical attack
        baseDamage = attacker.stats.ATK + (attacker.weapon?.ATK || 0);
      }
    } else if (ability.type === 'magic') {
      baseDamage = attacker.stats.MAG;
    } else {
      return 0; // Non-damaging ability
    }

    // Apply defense
    const defense = defender.stats.DEF + (defender.armor?.DEF || 0);
    const reducedDamage = Math.max(1, baseDamage - (defense * 0.5));

    return Math.floor(reducedDamage);
  }

  static calculateTurnOrder(characters) {
    return [...characters].sort((a, b) => {
      // Primary sort by SPD
      if (a.stats.SPD !== b.stats.SPD) {
        return b.stats.SPD - a.stats.SPD;
      }
      // Secondary sort by INT (for tie-breaking)
      return b.stats.INT - a.stats.INT;
    });
  }

  static applyAbilityEffects(character, ability, targets) {
    const results = [];

    for (const target of targets) {
      const result = {
        targetId: target.id,
        damage: 0,
        healing: 0,
        statChanges: [],
        statusEffects: []
      };

      // Apply damage
      if (ability.damage || ability.type === 'attack' || ability.type === 'magic') {
        result.damage = this.calculateDamage(character, target, ability);
        target.currentHP = Math.max(0, target.currentHP - result.damage);
      }

      // Apply healing
      if (ability.healing) {
        result.healing = ability.healing;
        target.currentHP = Math.min(target.stats.MAX_HP, target.currentHP + ability.healing);
      }

      // Apply stat changes
      if (ability.statChanges) {
        for (const change of ability.statChanges) {
          if (target.stats.hasOwnProperty(change.stat)) {
            target.stats[change.stat] += change.value;
            result.statChanges.push({
              stat: change.stat,
              value: change.value,
              duration: change.duration
            });
          }
        }
      }

      results.push(result);
    }

    return results;
  }

  static checkVictoryCondition(participants) {
    const team1Alive = participants.filter(p => p.team === 'team1' && p.currentHP > 0).length;
    const team2Alive = participants.filter(p => p.team === 'team2' && p.currentHP > 0).length;

    if (team1Alive === 0) return 'team2';
    if (team2Alive === 0) return 'team1';
    return null; // Battle continues
  }
}

// Gem Type base stats (reference to Gem-Type mentioned in docs)
const GEM_TYPE_BASE_STATS = {
  'Diamond': { HP: 100, ATK: 15, DEF: 12, SPD: 6, INT: 8, MAG: 10 },
  'Quartz': { HP: 80, ATK: 12, DEF: 10, SPD: 8, INT: 6, MAG: 6 },
  'Pearl': { HP: 60, ATK: 8, DEF: 6, SPD: 12, INT: 10, MAG: 8 },
  'Ruby': { HP: 70, ATK: 14, DEF: 8, SPD: 10, INT: 7, MAG: 4 },
  'Sapphire': { HP: 65, ATK: 10, DEF: 7, SPD: 11, INT: 12, MAG: 12 },
  'Amethyst': { HP: 75, ATK: 11, DEF: 9, SPD: 9, INT: 8, MAG: 8 },
  'Lapis Lazuli': { HP: 55, ATK: 9, DEF: 5, SPD: 10, INT: 14, MAG: 16 },
  'Peridot': { HP: 50, ATK: 7, DEF: 6, SPD: 8, INT: 13, MAG: 10 },
  'Jasper': { HP: 90, ATK: 13, DEF: 14, SPD: 5, INT: 5, MAG: 2 },
  'Bismuth': { HP: 85, ATK: 16, DEF: 15, SPD: 4, INT: 9, MAG: 0 }
};

function createGemCharacter(gemData) {
  const baseStats = GEM_TYPE_BASE_STATS[gemData.gemType] || {
    HP: 70, ATK: 10, DEF: 8, SPD: 8, INT: 8, MAG: 8
  };

  return {
    id: generateId(),
    name: gemData.name,
    type: 'Gem',
    gemType: gemData.gemType,
    facet: gemData.facet,
    cut: gemData.cut,
    era: gemData.era,
    gemPlacement: gemData.gemPlacement,
    placeOfBirth: gemData.placeOfBirth,
    personality: gemData.personality,
    likes: gemData.likes,
    dislikes: gemData.dislikes,
    relationships: gemData.relationships,
    fear: gemData.fear,
    alignment: gemData.alignment,
    stats: {
      HP: baseStats.HP,
      MAX_HP: baseStats.HP,
      ATK: baseStats.ATK,
      DEF: baseStats.DEF,
      SPD: baseStats.SPD,
      INT: baseStats.INT,
      MAG: baseStats.MAG,
      LVL: gemData.LVL || 1,
      EXP: gemData.EXP || 0
    },
    weapon: gemData.weapon,
    armor: gemData.armor,
    accessories: gemData.accessories,
    abilities: gemData.abilities || [],
    naturalHeight: gemData.naturalHeight,
    appearance: gemData.appearance,
    currentHP: baseStats.HP // Start with full HP
  };
}

function createOrganicCharacter(organicData) {
  // Calculate base stats for organics
  const maxHP = organicData.age ? organicData.age * 2 : 20; // Age × 2, minimum 20
  const baseATK = organicData.adult ? 5 : 0; // 5 for adults, 0 for children
  const baseDEF = organicData.adult ? 10 : 0; // 10 for adults, 0 for children

  return {
    id: generateId(),
    name: organicData.name,
    type: 'Organic',
    personality: organicData.personality,
    likes: organicData.likes,
    dislikes: organicData.dislikes,
    relationships: organicData.relationships,
    fear: organicData.fear,
    alignment: organicData.alignment,
    stats: {
      HP: maxHP,
      MAX_HP: maxHP,
      ATK: baseATK,
      DEF: baseDEF,
      SPD: organicData.SPD || 5,
      INT: organicData.INT || 5,
      MAG: organicData.MAG || 0, // Most organics have 0 magic
      LVL: organicData.LVL || 1,
      EXP: organicData.EXP || 0
    },
    weapon: organicData.weapon,
    armor: organicData.armor,
    accessories: organicData.accessories,
    abilities: organicData.abilities || [],
    appearance: organicData.appearance,
    currentHP: maxHP // Start with full HP
  };
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

module.exports = {
  StarPointSystem,
  CharacterStats,
  BattleCalculator,
  createGemCharacter,
  createOrganicCharacter,
  generateId,
  GEM_TYPE_BASE_STATS
};