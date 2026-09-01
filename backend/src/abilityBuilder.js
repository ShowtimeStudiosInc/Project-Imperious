// Simplified Custom Ability System

class AbilityBuilder {
  static DAMAGE_TYPES = {
    PHYSICAL: 'physical',
    MAGICAL: 'magical',
    FIRE: 'fire',
    ICE: 'ice',
    ELECTRIC: 'electric',
    POISON: 'poison',
    HOLY: 'holy',
    DARK: 'dark'
  };

  static DAMAGE_TYPE_EFFECTS = {
    physical: {
      name: 'Physical',
      description: 'Standard physical damage',
      specialEffect: null
    },
    magical: {
      name: 'Magical', 
      description: 'Standard magical damage',
      specialEffect: null
    },
    fire: {
      name: 'Fire',
      description: 'Burn damage over time',
      specialEffect: 'burn'
    },
    ice: {
      name: 'Ice',
      description: 'Freezes enemy instead of poofing/dying',
      specialEffect: 'freeze'
    },
    electric: {
      name: 'Electric',
      description: 'Chance to stun',
      specialEffect: 'stun'
    },
    poison: {
      name: 'Poison',
      description: 'Damage over time',
      specialEffect: 'poison'
    },
    holy: {
      name: 'Holy',
      description: 'Extra damage to dark types',
      specialEffect: 'holy_bonus'
    },
    dark: {
      name: 'Dark',
      description: 'Extra damage to holy types',
      specialEffect: 'dark_bonus'
    }
  };

  static parseDamageFormula(formula, characterStats) {
    // Parse formulas like: "5d3+[MAG]" or "10+[ATK]*0.5" or just "15"
    try {
      let parsedFormula = formula.toUpperCase();
      
      // Replace stat references with actual values
      parsedFormula = parsedFormula.replace(/\[MAG\]/g, characterStats.MAG);
      parsedFormula = parsedFormula.replace(/\[ATK\]/g, characterStats.ATK);
      parsedFormula = parsedFormula.replace(/\[DEF\]/g, characterStats.DEF);
      parsedFormula = parsedFormula.replace(/\[SPD\]/g, characterStats.SPD);
      parsedFormula = parsedFormula.replace(/\[INT\]/g, characterStats.INT);
      parsedFormula = parsedFormula.replace(/\[HP\]/g, characterStats.HP);
      parsedFormula = parsedFormula.replace(/\[LVL\]/g, characterStats.LVL);
      
      // Handle dice rolls (e.g., 5d3 = roll 5 dice with 3 sides each)
      const dicePattern = /(\d+)d(\d+)/g;
      parsedFormula = parsedFormula.replace(dicePattern, (match, numDice, numSides) => {
        return this.rollDice(parseInt(numDice), parseInt(numSides));
      });
      
      // Evaluate the mathematical expression
      // Using Function constructor for safe math evaluation
      const result = new Function('return ' + parsedFormula)();
      
      return Math.max(0, Math.floor(result));
    } catch (error) {
      console.error('Error parsing damage formula:', error);
      return 0; // Return 0 if formula is invalid
    }
  }

  static rollDice(numDice, numSides) {
    let total = 0;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * numSides) + 1;
    }
    return total;
  }

  static applyDamageTypeEffects(damageType, damage, target, currentTurn) {
    const effect = this.DAMAGE_TYPE_EFFECTS[damageType];
    if (!effect || !effect.specialEffect) {
      return { damage, statusEffects: [] };
    }

    const statusEffects = [];

    switch (effect.specialEffect) {
      case 'freeze':
        // Ice damage freezes instead of killing at 0 HP
        statusEffects.push({
          type: 'frozen',
          duration: 2, // Lasts 2 turns
          description: 'Frozen solid - cannot act but cannot poof'
        });
        break;
      
      case 'burn':
        // Fire damage causes burn damage over time
        statusEffects.push({
          type: 'burning',
          duration: 3,
          damage: Math.floor(damage * 0.1), // 10% of original damage per turn
          description: 'Burning - takes damage over time'
        });
        break;
      
      case 'stun':
        // Electric damage has chance to stun
        if (Math.random() < 0.3) { // 30% chance
          statusEffects.push({
            type: 'stunned',
            duration: 1,
            description: 'Stunned - cannot act this turn'
          });
        }
        break;
      
      case 'poison':
        // Poison damage over time
        statusEffects.push({
          type: 'poisoned',
          duration: 4,
          damage: Math.floor(damage * 0.15), // 15% of original damage per turn
          description: 'Poisoned - takes damage over time'
        });
        break;
      
      case 'holy_bonus':
        // Extra damage against dark-aligned targets
        if (target.alignment === 'dark' || target.alignment === 'evil') {
          damage = Math.floor(damage * 1.5); // 50% extra damage
        }
        break;
      
      case 'dark_bonus':
        // Extra damage against holy-aligned targets
        if (target.alignment === 'holy' || target.alignment === 'good') {
          damage = Math.floor(damage * 1.5); // 50% extra damage
        }
        break;
    }

    return { damage, statusEffects };
  }

  static validateAbility(ability) {
    const errors = [];

    // Check required fields
    if (!ability.name || ability.name.trim() === '') {
      errors.push('Ability name is required');
    }

    if (!ability.starPointCost || ability.starPointCost < 1) {
      errors.push('Star Point cost must be at least 1');
    }

    if (ability.starPointCost > 10) {
      errors.push('Star Point cost cannot exceed 10');
    }

    if (!ability.damageFormula || ability.damageFormula.trim() === '') {
      errors.push('Damage formula is required');
    } else {
      // Try to validate the formula syntax
      try {
        this.parseDamageFormula(ability.damageFormula, { MAG: 10, ATK: 10, DEF: 10, SPD: 10, INT: 10, HP: 100, LVL: 1 });
      } catch (error) {
        errors.push('Invalid damage formula syntax');
      }
    }

    if (!ability.damageType || !this.DAMAGE_TYPES[ability.damageType.toUpperCase()]) {
      errors.push('Invalid damage type');
    }

    if (!ability.description || ability.description.trim() === '') {
      errors.push('Description is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static calculateAbilityCost(ability) {
    // Auto-suggest Star Point cost based on damage potential
    let suggestedCost = 1;

    try {
      const testStats = { MAG: 10, ATK: 10, DEF: 10, SPD: 10, INT: 10, HP: 100, LVL: 1 };
      const avgDamage = this.parseDamageFormula(ability.damageFormula, testStats);
      
      // Base cost on average damage
      if (avgDamage < 10) suggestedCost = 1;
      else if (avgDamage < 20) suggestedCost = 2;
      else if (avgDamage < 35) suggestedCost = 3;
      else if (avgDamage < 50) suggestedCost = 4;
      else if (avgDamage < 70) suggestedCost = 5;
      else suggestedCost = 6;

      // Add cost for special damage types
      const specialTypes = ['fire', 'ice', 'electric', 'poison', 'holy', 'dark'];
      if (specialTypes.includes(ability.damageType?.toLowerCase())) {
        suggestedCost += 1;
      }

      // Cap at 10
      suggestedCost = Math.min(10, suggestedCost);
    } catch (error) {
      suggestedCost = 3; // Default middle cost if calculation fails
    }

    return suggestedCost;
  }
}

class AbilityExecutor {
  static executeAbility(ability, attacker, target) {
    const { DAMAGE_TYPE_EFFECTS } = AbilityBuilder;
    
    // Calculate base damage
    const baseDamage = AbilityBuilder.parseDamageFormula(ability.damageFormula, attacker.stats);
    
    // Apply defense reduction
    const defense = target.stats.DEF + (target.armor?.DEF || 0);
    const reducedDamage = Math.max(1, baseDamage - (defense * 0.5));
    
    // Apply damage type effects
    const { damage, statusEffects } = AbilityBuilder.applyDamageTypeEffects(
      ability.damageType,
      Math.floor(reducedDamage),
      target,
      0
    );
    
    // Apply damage to target
    const previousHP = target.currentHP;
    target.currentHP = Math.max(0, target.currentHP - damage);
    
    // Check for freeze effect (ice damage at 0 HP)
    let isFrozen = false;
    if (ability.damageType === 'ice' && target.currentHP === 0) {
      const freezeEffect = statusEffects.find(e => e.type === 'frozen');
      if (freezeEffect) {
        target.currentHP = 1; // Keep at 1 HP instead of 0
        target.statusEffects = target.statusEffects || [];
        target.statusEffects.push(freezeEffect);
        isFrozen = true;
      }
    } else if (statusEffects.length > 0) {
      target.statusEffects = target.statusEffects || [];
      target.statusEffects.push(...statusEffects);
    }
    
    return {
      success: true,
      damage,
      previousHP,
      newHP: target.currentHP,
      statusEffects,
      isFrozen,
      battleText: ability.battleText || `${attacker.name} used ${ability.name}!`,
      damageType: ability.damageType
    };
  }
}

module.exports = {
  AbilityBuilder,
  AbilityExecutor
};