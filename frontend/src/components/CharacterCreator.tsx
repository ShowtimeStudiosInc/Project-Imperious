import React, { useState } from 'react';

interface CharacterStats {
  HP: number;
  MAX_HP: number;
  ATK: number;
  DEF: number;
  SPD: number;
  INT: number;
  MAG: number;
  LVL: number;
  EXP: number;
}

interface Character {
  name: string;
  type: 'Gem' | 'Organic';
  stats: CharacterStats;
  gemType?: string;
  facet?: string;
  cut?: string;
  era?: string;
  age?: number;
  adult?: boolean;
}

interface CharacterCreatorProps {
  userId?: string;
  token?: string;
}

const GEM_TYPES = ['Diamond', 'Quartz', 'Pearl', 'Ruby', 'Sapphire', 'Amethyst', 'Lapis Lazuli', 'Peridot', 'Jasper', 'Bismuth'];

const GEM_BASE_STATS: Record<string, CharacterStats> = {
  'Diamond': { HP: 100, MAX_HP: 100, ATK: 15, DEF: 12, SPD: 6, INT: 8, MAG: 10, LVL: 1, EXP: 0 },
  'Quartz': { HP: 80, MAX_HP: 80, ATK: 12, DEF: 10, SPD: 8, INT: 6, MAG: 6, LVL: 1, EXP: 0 },
  'Pearl': { HP: 60, MAX_HP: 60, ATK: 8, DEF: 6, SPD: 12, INT: 10, MAG: 8, LVL: 1, EXP: 0 },
  'Ruby': { HP: 70, MAX_HP: 70, ATK: 14, DEF: 8, SPD: 10, INT: 7, MAG: 4, LVL: 1, EXP: 0 },
  'Sapphire': { HP: 65, MAX_HP: 65, ATK: 10, DEF: 7, SPD: 11, INT: 12, MAG: 12, LVL: 1, EXP: 0 },
  'Amethyst': { HP: 75, MAX_HP: 75, ATK: 11, DEF: 9, SPD: 9, INT: 8, MAG: 8, LVL: 1, EXP: 0 },
  'Lapis Lazuli': { HP: 55, MAX_HP: 55, ATK: 9, DEF: 5, SPD: 10, INT: 14, MAG: 16, LVL: 1, EXP: 0 },
  'Peridot': { HP: 50, MAX_HP: 50, ATK: 7, DEF: 6, SPD: 8, INT: 13, MAG: 10, LVL: 1, EXP: 0 },
  'Jasper': { HP: 90, MAX_HP: 90, ATK: 13, DEF: 14, SPD: 5, INT: 5, MAG: 2, LVL: 1, EXP: 0 },
  'Bismuth': { HP: 85, MAX_HP: 85, ATK: 16, DEF: 15, SPD: 4, INT: 9, MAG: 0, LVL: 1, EXP: 0 }
};

export default function CharacterCreator({ userId, token }: CharacterCreatorProps) {
  const [characterType, setCharacterType] = useState<'Gem' | 'Organic'>('Gem');
  const [character, setCharacter] = useState<Partial<Character>>({
    name: '',
    type: 'Gem',
    stats: { ...GEM_BASE_STATS['Quartz'] }
  });

  const updateCharacter = (field: string, value: any) => {
    setCharacter(prev => ({ ...prev, [field]: value }));
  };

  const updateStat = (stat: keyof CharacterStats, value: number) => {
    setCharacter(prev => ({
      ...prev,
      stats: { ...prev.stats!, [stat]: value }
    }));
  };

  const handleGemTypeChange = (gemType: string) => {
    const baseStats = GEM_BASE_STATS[gemType] || GEM_BASE_STATS['Quartz'];
    setCharacter(prev => ({
      ...prev,
      gemType,
      stats: { ...baseStats }
    }));
  };

  const handleOrganicCalculation = () => {
    const age = character.age || 20;
    const adult = character.adult !== false;
    const maxHP = age * 2;
    const baseATK = adult ? 5 : 0;
    const baseDEF = adult ? 10 : 0;

    setCharacter(prev => ({
      ...prev,
      stats: {
        HP: maxHP,
        MAX_HP: maxHP,
        ATK: baseATK,
        DEF: baseDEF,
        SPD: prev.stats?.SPD || 5,
        INT: prev.stats?.INT || 5,
        MAG: prev.stats?.MAG || 0,
        LVL: 1,
        EXP: 0
      }
    }));
  };

  const saveCharacter = async () => {
    if (!token) {
      alert('Please log in to create characters');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/characters/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(character)
      });
      const data = await response.json();
      if (data.success) {
        alert('Character created successfully!');
        console.log('Created character:', data.character);
      } else {
        alert(data.error || 'Failed to create character');
      }
    } catch (error) {
      console.error('Error creating character:', error);
      alert('Failed to create character');
    }
  };

  return (
    <div className="character-creator">
      <h2>Create Character</h2>
      
      <div className="character-type-selector">
        <button
          className={characterType === 'Gem' ? 'active' : ''}
          onClick={() => {
            setCharacterType('Gem');
            updateCharacter('type', 'Gem');
            handleGemTypeChange('Quartz');
          }}
        >
          Gem
        </button>
        <button
          className={characterType === 'Organic' ? 'active' : ''}
          onClick={() => {
            setCharacterType('Organic');
            updateCharacter('type', 'Organic');
            handleOrganicCalculation();
          }}
        >
          Organic
        </button>
      </div>

      <div className="character-form">
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={character.name}
            onChange={(e) => updateCharacter('name', e.target.value)}
            placeholder="Character name"
          />
        </div>

        {characterType === 'Gem' && (
          <>
            <div className="form-group">
              <label>Gem Type</label>
              <select
                value={character.gemType}
                onChange={(e) => handleGemTypeChange(e.target.value)}
              >
                {GEM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Facet</label>
              <input
                type="text"
                value={character.facet || ''}
                onChange={(e) => updateCharacter('facet', e.target.value)}
                placeholder="Facet code"
              />
            </div>
            <div className="form-group">
              <label>Cut</label>
              <input
                type="text"
                value={character.cut || ''}
                onChange={(e) => updateCharacter('cut', e.target.value)}
                placeholder="Cut code"
              />
            </div>
            <div className="form-group">
              <label>Era</label>
              <input
                type="text"
                value={character.era || ''}
                onChange={(e) => updateCharacter('era', e.target.value)}
                placeholder="Era"
              />
            </div>
          </>
        )}

        {characterType === 'Organic' && (
          <>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                value={character.age || ''}
                onChange={(e) => updateCharacter('age', parseInt(e.target.value))}
                placeholder="Age"
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={character.adult}
                  onChange={(e) => updateCharacter('adult', e.target.checked)}
                />
                Adult
              </label>
            </div>
          </>
        )}
      </div>

      <div className="stats-display">
        <h3>Current Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <label>HP</label>
            <input
              type="number"
              value={character.stats?.HP || 0}
              onChange={(e) => updateStat('HP', parseInt(e.target.value))}
            />
          </div>
          <div className="stat-item">
            <label>ATK</label>
            <input
              type="number"
              value={character.stats?.ATK || 0}
              onChange={(e) => updateStat('ATK', parseInt(e.target.value))}
            />
          </div>
          <div className="stat-item">
            <label>DEF</label>
            <input
              type="number"
              value={character.stats?.DEF || 0}
              onChange={(e) => updateStat('DEF', parseInt(e.target.value))}
            />
          </div>
          <div className="stat-item">
            <label>SPD</label>
            <input
              type="number"
              value={character.stats?.SPD || 0}
              onChange={(e) => updateStat('SPD', parseInt(e.target.value))}
            />
          </div>
          <div className="stat-item">
            <label>INT</label>
            <input
              type="number"
              value={character.stats?.INT || 0}
              onChange={(e) => updateStat('INT', parseInt(e.target.value))}
            />
          </div>
          <div className="stat-item">
            <label>MAG</label>
            <input
              type="number"
              value={character.stats?.MAG || 0}
              onChange={(e) => updateStat('MAG', parseInt(e.target.value))}
            />
          </div>
        </div>
        {character.stats && (
          <div className="additional-info">
            <p>Running Speed: {character.stats.SPD * 3} km/h</p>
            <p>Level: {character.stats.LVL} | EXP: {character.stats.EXP}</p>
          </div>
        )}
      </div>

      <button className="btn-primary" onClick={saveCharacter}>
        Create Character
      </button>
    </div>
  );
}