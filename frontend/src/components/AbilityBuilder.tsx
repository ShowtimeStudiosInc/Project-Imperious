import { useState } from 'react';

interface CustomAbility {
  name: string;
  starPointCost: number;
  damageFormula: string;
  damageType: string;
  description: string;
  battleText: string;
}

interface AbilityBuilderProps {
  token?: string;
}

const DAMAGE_TYPES = [
  { value: 'physical', label: 'Physical', description: 'Standard physical damage' },
  { value: 'magical', label: 'Magical', description: 'Standard magical damage' },
  { value: 'fire', label: 'Fire', description: 'Burn damage over time' },
  { value: 'ice', label: 'Ice', description: 'Freezes enemy instead of poofing/dying' },
  { value: 'electric', label: 'Electric', description: 'Chance to stun' },
  { value: 'poison', label: 'Poison', description: 'Damage over time' },
  { value: 'holy', label: 'Holy', description: 'Extra damage to dark types' },
  { value: 'dark', label: 'Dark', description: 'Extra damage to holy types' }
];

const STAT_VARIABLES = [
  { var: '[MAG]', label: 'Magic Attack', description: 'Character\'s MAG stat' },
  { var: '[ATK]', label: 'Physical Attack', description: 'Character\'s ATK stat' },
  { var: '[DEF]', label: 'Defense', description: 'Character\'s DEF stat' },
  { var: '[SPD]', label: 'Speed', description: 'Character\'s SPD stat' },
  { var: '[INT]', label: 'Intelligence', description: 'Character\'s INT stat' },
  { var: '[HP]', label: 'Health Points', description: 'Character\'s current HP' },
  { var: '[LVL]', label: 'Level', description: 'Character\'s LVL' }
];

export default function AbilityBuilder({ token }: AbilityBuilderProps) {
  const [ability, setAbility] = useState<CustomAbility>({
    name: '',
    starPointCost: 3,
    damageFormula: '',
    damageType: 'physical',
    description: '',
    battleText: ''
  });

  const [previewDamage, setPreviewDamage] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [suggestedCost, setSuggestedCost] = useState<number>(3);

  const updateAbility = (field: keyof CustomAbility, value: any) => {
    setAbility(prev => ({ ...prev, [field]: value }));
  };

  const insertVariable = (variable: string) => {
    setAbility(prev => ({
      ...prev,
      damageFormula: prev.damageFormula + variable
    }));
  };

  const testFormula = async () => {
    if (!token) {
      alert('Please log in to test formulas');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/abilities/test-formula', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          formula: ability.damageFormula,
          testStats: { MAG: 15, ATK: 12, DEF: 10, SPD: 8, INT: 10, HP: 100, LVL: 5 }
        })
      });
      const data = await response.json();
      if (data.success) {
        setPreviewDamage(data.damage);
      } else {
        setPreviewDamage(null);
      }
    } catch (error) {
      console.error('Error testing formula:', error);
    }
  };

  const validateAbility = async () => {
    if (!token) {
      alert('Please log in to validate abilities');
      return false;
    }

    try {
      const response = await fetch('http://localhost:5000/api/abilities/validate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ability)
      });
      const data = await response.json();
      setValidationErrors(data.errors || []);
      return data.isValid;
    } catch (error) {
      console.error('Error validating ability:', error);
      return false;
    }
  };

  const calculateSuggestedCost = async () => {
    if (!token) {
      alert('Please log in to calculate costs');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/abilities/suggest-cost', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ability)
      });
      const data = await response.json();
      if (data.success) {
        setSuggestedCost(data.suggestedCost);
        setAbility(prev => ({ ...prev, starPointCost: data.suggestedCost }));
      }
    } catch (error) {
      console.error('Error calculating cost:', error);
    }
  };

  const saveAbility = async () => {
    if (!token) {
      alert('Please log in to save abilities');
      return;
    }

    const isValid = await validateAbility();
    if (!isValid) {
      alert('Please fix validation errors before saving');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/abilities/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ability)
      });
      const data = await response.json();
      if (data.success) {
        alert('Ability created successfully!');
        console.log('Created ability:', data.ability);
      } else {
        alert(data.error || 'Failed to save ability');
      }
    } catch (error) {
      console.error('Error saving ability:', error);
      alert('Failed to save ability');
    }
  };

  return (
    <div className="ability-builder">
      <h2>Create Custom Ability</h2>
      
      <div className="ability-form">
        <div className="form-group">
          <label>Ability Name *</label>
          <input
            type="text"
            value={ability.name}
            onChange={(e) => updateAbility('name', e.target.value)}
            placeholder="e.g., Fire Blast"
          />
        </div>

        <div className="form-group">
          <label>Star Point Cost *</label>
          <div className="cost-input-group">
            <input
              type="number"
              min="1"
              max="10"
              value={ability.starPointCost}
              onChange={(e) => updateAbility('starPointCost', parseInt(e.target.value))}
            />
            <button 
              className="btn-secondary" 
              onClick={calculateSuggestedCost}
              type="button"
            >
              Auto-Calculate
            </button>
          </div>
          <small className="help-text">Click "Auto-Calculate" to suggest cost based on damage</small>
        </div>

        <div className="form-group">
          <label>Damage Formula *</label>
          <input
            type="text"
            value={ability.damageFormula}
            onChange={(e) => updateAbility('damageFormula', e.target.value)}
            placeholder="e.g., 5d3+[MAG] or 15+[ATK]*0.5"
          />
          <div className="formula-help">
            <p className="help-text">Examples:</p>
            <ul className="formula-examples">
              <li><code>15</code> - Fixed 15 damage</li>
              <li><code>5d3+[MAG]</code> - 5 dice (3 sides) + Magic stat</li>
              <li><code>[ATK]*1.5</code> - Attack stat × 1.5</li>
              <li><code>10+[LVL]*2</code> - 10 + (Level × 2)</li>
            </ul>
          </div>
          <div className="variable-buttons">
            <p className="help-text">Insert variables:</p>
            <div className="variable-grid">
              {STAT_VARIABLES.map(stat => (
                <button
                  key={stat.var}
                  className="btn-variable"
                  onClick={() => insertVariable(stat.var)}
                  type="button"
                >
                  {stat.var}
                </button>
              ))}
            </div>
          </div>
          <button 
            className="btn-secondary" 
            onClick={testFormula}
            type="button"
          >
            Test Formula
          </button>
          {previewDamage !== null && (
            <div className="formula-preview">
              <strong>Preview Damage (test stats):</strong> {previewDamage}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Damage Type *</label>
          <select
            value={ability.damageType}
            onChange={(e) => updateAbility('damageType', e.target.value)}
          >
            {DAMAGE_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
          <div className="damage-type-info">
            <p className="help-text">
              {DAMAGE_TYPES.find(t => t.value === ability.damageType)?.description}
            </p>
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={ability.description}
            onChange={(e) => updateAbility('description', e.target.value)}
            placeholder="Describe what this ability does (flavor text)"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Battle Text</label>
          <input
            type="text"
            value={ability.battleText}
            onChange={(e) => updateAbility('battleText', e.target.value)}
            placeholder="e.g., '{name} unleashes a blazing inferno!'"
          />
          <small className="help-text">Text that appears when the ability is used</small>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h4>Please fix these errors:</h4>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="ability-preview">
        <h3>Ability Preview</h3>
        <div className="preview-card">
          <h4>{ability.name || 'Ability Name'}</h4>
          <p><strong>Cost:</strong> {ability.starPointCost} Star Points</p>
          <p><strong>Damage:</strong> {ability.damageFormula || 'No formula'}</p>
          <p><strong>Type:</strong> {DAMAGE_TYPES.find(t => t.value === ability.damageType)?.label}</p>
          <p><strong>Description:</strong> {ability.description || 'No description'}</p>
          {ability.battleText && (
            <p className="battle-text-preview"><strong>Battle Text:</strong> "{ability.battleText}"</p>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button className="btn-primary" onClick={saveAbility}>
          Save Ability
        </button>
        <button className="btn-secondary" onClick={validateAbility}>
          Validate
        </button>
      </div>
    </div>
  );
}