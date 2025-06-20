import React, { useState, useEffect } from 'react';
import { analyzePasswordSecurity, quickPasswordCheck, SECURITY_LEVELS, type PasswordAnalysis, type PasswordStrengthRequirements } from '../../utils/passwordSecurity';
import { ExclamationTriangleIcon, ShieldCheckIcon, ClockIcon, KeyIcon } from '@heroicons/react/24/outline';

const PasswordAnalyzer: React.FC = () => {
  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quickCheck, setQuickCheck] = useState({ strength: '', score: 0, color: '' });
  const [selectedLevel, setSelectedLevel] = useState<keyof typeof SECURITY_LEVELS>('standard');

  // Real-time quick check
  useEffect(() => {
    if (password) {
      setQuickCheck(quickPasswordCheck(password));
    } else {
      setQuickCheck({ strength: '', score: 0, color: '' });
    }
  }, [password]);

  const handleFullAnalysis = async () => {
    if (!password) return;
    
    setIsAnalyzing(true);
    try {
      const requirements: PasswordStrengthRequirements = {
        minLength: 12,
        maxLength: 256,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        forbidCommonPasswords: true,
        forbidKeyboardPatterns: true,
        forbidRepeatedChars: true,
        forbidDictionaryWords: true,
        minEntropy: SECURITY_LEVELS[selectedLevel].minEntropy
      };
      
      const result = await analyzePasswordSecurity(password, requirements);
      setAnalysis(result);
    } catch (error) {
      console.error('Password analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength.toLowerCase()) {
      case 'very-weak': return 'text-red-600';
      case 'weak': return 'text-orange-500';
      case 'fair': return 'text-yellow-500';
      case 'good': return 'text-blue-500';
      case 'strong': return 'text-green-500';
      case 'excellent': return 'text-emerald-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <KeyIcon className="h-6 w-6 text-cyan-400" />
          <h3 className="text-xl font-semibold text-slate-100">Password Security Analyzer</h3>
        </div>
        
        {/* Password Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password to Analyze</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password for analysis..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {quickCheck.strength && (
                <div className="absolute right-3 top-2">
                  <span className={`text-sm font-medium ${quickCheck.color}`}>
                    {quickCheck.strength}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Security Level Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Security Level Requirement</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as keyof typeof SECURITY_LEVELS)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm"
            >
              {Object.entries(SECURITY_LEVELS).map(([key, level]) => (
                <option key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} - {level.description} ({level.minEntropy} bits)
                </option>
              ))}
            </select>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleFullAnalysis}
            disabled={!password || isAnalyzing}
            className="w-full px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analyzing...' : 'Run Full Security Analysis'}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-slate-100 mb-4">Security Analysis Results</h4>
          
          {/* Overall Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Strength</span>
                <span className={`font-semibold ${getStrengthColor(analysis.strength)} capitalize`}>
                  {analysis.strength.replace('-', ' ')}
                </span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      analysis.score < 30 ? 'bg-red-500' :
                      analysis.score < 50 ? 'bg-orange-500' :
                      analysis.score < 70 ? 'bg-yellow-500' :
                      analysis.score < 90 ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 mt-1">Score: {analysis.score}/100</span>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Entropy</span>
                <span className="font-semibold text-slate-100">{analysis.entropy} bits</span>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Required: {SECURITY_LEVELS[selectedLevel].minEntropy} bits
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400 text-sm">Time to Break</span>
              </div>
              <div className="mt-1 font-semibold text-slate-100 text-sm">
                {analysis.timeToBreak}
              </div>
            </div>
          </div>

          {/* Character Set Analysis */}
          <div className="mb-6">
            <h5 className="font-medium text-slate-200 mb-3">Character Set Analysis</h5>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries({
                'Lowercase': analysis.charset.hasLowercase,
                'Uppercase': analysis.charset.hasUppercase,
                'Numbers': analysis.charset.hasNumbers,
                'Symbols': analysis.charset.hasSymbols,
                'Unicode': analysis.charset.hasUnicode
              }).map(([type, present]) => (
                <div key={type} className={`flex items-center space-x-2 px-2 py-1 rounded text-xs ${
                  present ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${present ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vulnerabilities */}
          {analysis.vulnerabilities.length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-slate-200 mb-3 flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <span>Security Vulnerabilities</span>
              </h5>
              <div className="space-y-2">
                {analysis.vulnerabilities.map((vuln, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                    <span className="text-red-200">{vuln}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patterns Detected */}
          {analysis.patterns.length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-slate-200 mb-3">Patterns Detected</h5>
              <div className="space-y-2">
                {analysis.patterns.map((pattern, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                    <span className="text-yellow-200">{pattern}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div>
              <h5 className="font-medium text-slate-200 mb-3 flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-400" />
                <span>Security Recommendations</span>
              </h5>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                    <span className="text-green-200">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blacklist Status */}
          {analysis.isBlacklisted && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <span className="text-red-200 font-medium">
                  Password found in {analysis.blacklistSource} breach database
                </span>
              </div>
              <p className="text-red-300 text-sm mt-1">
                This password has been compromised and should never be used.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordAnalyzer; 