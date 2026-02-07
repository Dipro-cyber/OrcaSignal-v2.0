import React from 'react';
import { Settings, Users, Droplets, Vote, Sliders } from 'lucide-react';

const RiskThresholds = ({ thresholds, setThresholds }) => {
  const updateThreshold = (key, value) => {
    setThresholds(prev => ({
      ...prev,
      [key]: Math.min(100, Math.max(0, parseInt(value) || 0))
    }));
  };

  return (
    <div className="card interactive-card slide-up">
      <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff' }}>
        <Settings size={28} />
        Risk Tolerance Settings
      </h2>
      
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '32px', fontSize: '1.1rem' }}>
        Set your risk thresholds. Tokens exceeding these levels will trigger warnings.
      </p>

      <div className="grid grid-2">
        {/* Holder Concentration Threshold */}
        <div className="threshold-slider-container">
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="stat-icon" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
              <Users size={16} />
            </div>
            <span style={{ fontSize: '1.1rem' }}>Holder Concentration Threshold</span>
          </label>
          <div className="flex items-center gap-6">
            <input
              type="range"
              min="0"
              max="100"
              value={thresholds.holderConcentration}
              onChange={(e) => updateThreshold('holderConcentration', e.target.value)}
              className="threshold-slider"
              style={{ flex: 1 }}
            />
            <div style={{ 
              minWidth: '80px', 
              textAlign: 'center', 
              fontWeight: 'bold', 
              fontSize: '1.2rem',
              color: '#a855f7',
              background: 'rgba(168, 85, 247, 0.1)',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}>
              {thresholds.holderConcentration}%
            </div>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
            Warn if top holders control more than this % of supply
          </p>
          <div className="progress-bar" style={{ marginTop: '12px' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${thresholds.holderConcentration}%` }}
            ></div>
          </div>
        </div>

        {/* Liquidity Ownership Threshold */}
        <div className="threshold-slider-container">
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="stat-icon" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
              <Droplets size={16} />
            </div>
            <span style={{ fontSize: '1.1rem' }}>Liquidity Ownership Threshold</span>
          </label>
          <div className="flex items-center gap-6">
            <input
              type="range"
              min="0"
              max="100"
              value={thresholds.liquidityOwnership}
              onChange={(e) => updateThreshold('liquidityOwnership', e.target.value)}
              className="threshold-slider"
              style={{ flex: 1 }}
            />
            <div style={{ 
              minWidth: '80px', 
              textAlign: 'center', 
              fontWeight: 'bold', 
              fontSize: '1.2rem',
              color: '#06b6d4',
              background: 'rgba(6, 182, 212, 0.1)',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              {thresholds.liquidityOwnership}%
            </div>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
            Warn if LP concentration exceeds this threshold
          </p>
          <div className="progress-bar" style={{ marginTop: '12px' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${thresholds.liquidityOwnership}%` }}
            ></div>
          </div>
        </div>

        {/* Governance Capture Threshold */}
        <div className="threshold-slider-container">
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="stat-icon" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #ec4899, #be185d)' }}>
              <Vote size={16} />
            </div>
            <span style={{ fontSize: '1.1rem' }}>Governance Capture Threshold</span>
          </label>
          <div className="flex items-center gap-6">
            <input
              type="range"
              min="0"
              max="100"
              value={thresholds.governanceCapture}
              onChange={(e) => updateThreshold('governanceCapture', e.target.value)}
              className="threshold-slider"
              style={{ flex: 1 }}
            />
            <div style={{ 
              minWidth: '80px', 
              textAlign: 'center', 
              fontWeight: 'bold', 
              fontSize: '1.2rem',
              color: '#ec4899',
              background: 'rgba(236, 72, 153, 0.1)',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(236, 72, 153, 0.3)'
            }}>
              {thresholds.governanceCapture}%
            </div>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
            Warn if voting power concentration exceeds this %
          </p>
          <div className="progress-bar" style={{ marginTop: '12px' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${thresholds.governanceCapture}%` }}
            ></div>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="threshold-slider-container">
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="stat-icon" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <Sliders size={16} />
            </div>
            <span style={{ fontSize: '1.1rem' }}>Quick Presets</span>
          </label>
          <div className="flex gap-3">
            <button
              className="button-secondary text-sm glow"
              onClick={() => setThresholds({ holderConcentration: 90, liquidityOwnership: 80, governanceCapture: 90 })}
              style={{ flex: 1 }}
            >
              Conservative
            </button>
            <button
              className="button-secondary text-sm glow"
              onClick={() => setThresholds({ holderConcentration: 70, liquidityOwnership: 60, governanceCapture: 80 })}
              style={{ flex: 1 }}
            >
              Moderate
            </button>
            <button
              className="button-secondary text-sm glow"
              onClick={() => setThresholds({ holderConcentration: 50, liquidityOwnership: 40, governanceCapture: 60 })}
              style={{ flex: 1 }}
            >
              Aggressive
            </button>
          </div>
        </div>
      </div>

      {/* Risk Tolerance Summary */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05))', 
        marginTop: '32px', 
        border: '1px solid rgba(168, 85, 247, 0.2)' 
      }}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '16px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={20} />
          Current Risk Profile
        </h4>
        <div className="grid grid-3 gap-6">
          <div className="text-center">
            <div style={{ color: '#a855f7', fontSize: '0.9rem', marginBottom: '4px' }}>Holder Risk</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#ffffff' }}>{thresholds.holderConcentration}%</div>
          </div>
          <div className="text-center">
            <div style={{ color: '#06b6d4', fontSize: '0.9rem', marginBottom: '4px' }}>Liquidity Risk</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#ffffff' }}>{thresholds.liquidityOwnership}%</div>
          </div>
          <div className="text-center">
            <div style={{ color: '#ec4899', fontSize: '0.9rem', marginBottom: '4px' }}>Governance Risk</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#ffffff' }}>{thresholds.governanceCapture}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskThresholds;