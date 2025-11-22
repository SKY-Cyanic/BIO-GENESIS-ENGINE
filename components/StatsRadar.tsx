import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Stats, Language } from '../types';

interface StatsRadarProps {
  stats: Stats;
  language: Language;
}

const StatsRadar: React.FC<StatsRadarProps> = ({ stats, language }) => {
  const labels = {
    hp: language === 'ko' ? '체력 (HP)' : 'HP (Vitality)',
    speed: language === 'ko' ? '속도 (Speed)' : 'Speed (Mobility)',
    intelligence: language === 'ko' ? '지능 (Intel)' : 'Intel (Cognition)',
    stealth: language === 'ko' ? '은신 (Stealth)' : 'Stealth (Camouflage)',
  };

  const data = [
    { subject: labels.hp, A: stats.hp, fullMark: 100 },
    { subject: labels.speed, A: stats.speed, fullMark: 100 },
    { subject: labels.intelligence, A: stats.intelligence, fullMark: 100 },
    { subject: labels.stealth, A: stats.stealth, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Stats"
            dataKey="A"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="#06b6d4"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            itemStyle={{ color: '#06b6d4' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsRadar;