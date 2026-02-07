import React from 'react';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, Activity, BarChart3, Zap, Eye, Clock, Info } from 'lucide-react';

const RiskAnalysis = ({ riskData }) => {
  if (!riskData) return null;

  const { tokenInfo, riskScores, compositeScore, methodology, lastAnalyzed } = riskData;

  const getRiskLevel = (score) => {
    if (score <= 30) return 'low';
    if (score <= 70) return 'medium';
    return 'high';
  };

  const getRiskColor = (score) => {
    if (score <= 30) return '#10b981';
    if (score <= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getRiskGradient = (score) => {
    if (score <= 30) return 'linear-gradient(135deg, #10b981, #059669)';
    if (score <= 70) return 'linear-gradient(135deg, #f59e0b, #d97706)';
    return 'linear-gradient(135deg, #ef4444, #dc2626)';
  };

  const compositeLevel = getRiskLevel(compositeScore);

  // Animated progress bar component
  const RiskProgressBar = ({ score, label, icon: Icon, delay = 0 }) => {
    const color = getRiskColor(score);
    
    return (
      <div className="risk-progress-container" style={{ animationDelay: `${delay}ms` }}>
        <div className="risk-progress-header">
          <div className="risk-progress-label">
            <Icon size={20} color={color} />
            <span>{label}</span>
          </div>
          <div className="risk-progress-score" style={{ color }}>
            {score}%
          </div>
        </div>
        <div className="risk-progress-track">
          <div 
            className="risk-progress-fill"
            style={{ 
              width: `${score}%`,
              background: getRiskGradient(score),
              animationDelay: `${delay + 200}ms`
            }}
          />
          <div className="risk-progress-glow" style={{ left: `${score}%`, background: color }} />
        </div>
        <div className="risk-progress-markers">
          <div className="risk-marker" style={{ left: '30%' }}>
            <div className="risk-marker-line" />
            <span className="risk-marker-label">Low</span>
          </div>
          <div className="risk-marker" style={{ left: '70%' }}>
            <div className="risk-marker-line" />
            <span className="risk-marker-label">High</span>
          </div>
        </div>
      </div>
    );
  };

  // Circular progress component
  const CircularProgress = ({ score, size = 120 }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    return (
      <div className="circular-progress" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="circular-progress-svg">
          <defs>
            <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={getRiskColor(score)} stopOpacity="0.8" />
              <stop offset="100%" stopColor={getRiskColor(score)} stopOpacity="1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#gradient-${score})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="circular-progress-bar"
            filter="url(#glow)"
          />
        </svg>
        <div className="circular-progress-content">
          <div className="circular-progress-score">{score}</div>
          <div className="circular-progress-label">Risk Score</div>
        </div>
      </div>
    );
  };

  return (
    <div className="risk-analysis-container fade-in">
      {/* Header */}
      <div className="risk-analysis-header">
        <div className="risk-header-content">
          <div className="risk-header-icon">
            <Activity size={32} />
          </div>
          <div>
            <h2 className="risk-header-title">Risk Analysis Results</h2>
            <p className="risk-header-subtitle">
              Comprehensive risk assessment for {tokenInfo.symbol} ({tokenInfo.name})
            </p>
          </div>
        </div>
        <div className="risk-header-badge">
          <Eye size={16} />
          <span>Live Analysis</span>
          {lastAnalyzed && (
            <div className="risk-timestamp">
              <Clock size={14} />
              <span>{new Date(lastAnalyzed).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Composite Score */}
      <div className="composite-score-section">
        <div className="composite-score-card">
          <div className="composite-score-visual">
            <CircularProgress score={compositeScore} size={160} />
          </div>
          <div className="composite-score-details">
            <h3 className="composite-score-title">Composite Risk Score</h3>
            <div className={`composite-score-level composite-score-${compositeLevel}`}>
              {compositeLevel === 'low' && <CheckCircle size={20} />}
              {compositeLevel === 'medium' && <AlertTriangle size={20} />}
              {compositeLevel === 'high' && <AlertTriangle size={20} />}
              <span>{compositeLevel.toUpperCase()} RISK</span>
            </div>
            <p className="composite-score-description">
              {compositeLevel === 'low' && 'This token shows relatively low concentration risks across all factors.'}
              {compositeLevel === 'medium' && 'This token has moderate concentration risks that should be monitored.'}
              {compositeLevel === 'high' && 'This token exhibits high concentration risks requiring careful consideration.'}
            </p>
          </div>
        </div>
      </div>

      {/* Individual Risk Factors */}
      <div className="risk-factors-section">
        <h3 className="risk-factors-title">
          <BarChart3 size={24} />
          Risk Factor Breakdown
        </h3>
        
        <div className="risk-factors-grid">
          <RiskProgressBar 
            score={riskScores.holderConcentration}
            label="Holder Concentration"
            icon={Shield}
            delay={0}
          />
          <RiskProgressBar 
            score={riskScores.liquidityOwnership}
            label="Liquidity Ownership"
            icon={TrendingUp}
            delay={200}
          />
          <RiskProgressBar 
            score={riskScores.governanceCapture}
            label="Governance Capture"
            icon={Zap}
            delay={400}
          />
        </div>
      </div>

      {/* Token Information */}
      <div className="token-info-section">
        <h3 className="token-info-title">Token Information</h3>
        <div className="token-info-grid">
          <div className="token-info-item">
            <span className="token-info-label">Contract Address</span>
            <span className="token-info-value token-address">{tokenInfo.address}</span>
          </div>
          <div className="token-info-item">
            <span className="token-info-label">Symbol</span>
            <span className="token-info-value">{tokenInfo.symbol}</span>
          </div>
          <div className="token-info-item">
            <span className="token-info-label">Name</span>
            <span className="token-info-value">{tokenInfo.name}</span>
          </div>
          <div className="token-info-item">
            <span className="token-info-label">Decimals</span>
            <span className="token-info-value">{tokenInfo.decimals}</span>
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div className="methodology-section">
        <h3 className="methodology-title">
          <Info size={20} />
          Analysis Methodology
        </h3>
        <div className="methodology-grid">
          <div className="methodology-item">
            <div className="methodology-icon">
              <Shield size={20} />
            </div>
            <div className="methodology-content">
              <h4>Holder Concentration</h4>
              <p>{methodology.holderConcentration}</p>
            </div>
          </div>
          <div className="methodology-item">
            <div className="methodology-icon">
              <TrendingUp size={20} />
            </div>
            <div className="methodology-content">
              <h4>Liquidity Ownership</h4>
              <p>{methodology.liquidityOwnership}</p>
            </div>
          </div>
          <div className="methodology-item">
            <div className="methodology-icon">
              <Zap size={20} />
            </div>
            <div className="methodology-content">
              <h4>Governance Capture</h4>
              <p>{methodology.governanceCapture}</p>
            </div>
          </div>
        </div>
        <div className="methodology-disclaimer">
          <p>All scores are calculated from provable on-chain data and represent structural risk factors, not price predictions.</p>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;