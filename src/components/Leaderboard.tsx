import { UserProfile } from '../types';
import { Trophy, Medal, Star, Shield, Award } from 'lucide-react';

interface LeaderboardProps {
  members: UserProfile[];
}

export default function Leaderboard({ members }: LeaderboardProps) {
  // Sort members by total XP
  const sortedMembers = [...members].sort((a, b) => b.xp - a.xp);

  // Define gamified titles/badges
  const getBadges = (xp: number) => {
    const badges = [];
    if (xp >= 50) badges.push({ name: 'Chore Cadet 🌱', color: 'bg-green-100 text-green-700' });
    if (xp >= 150) badges.push({ name: 'Routine Knight 🛡️', color: 'bg-blue-100 text-blue-700' });
    if (xp >= 350) badges.push({ name: 'Streak Star 🌟', color: 'bg-amber-100 text-amber-700 animate-pulse' });
    if (xp >= 600) badges.push({ name: 'House Sovereign 👑', color: 'bg-purple-100 text-purple-700 border border-purple-300' });
    
    // Default badge
    if (badges.length === 0) {
      badges.push({ name: 'Rookie 🐣', color: 'bg-gray-100 text-gray-500' });
    }
    return badges;
  };

  const calculateLevelProgress = (xp: number) => {
    const xpPerLevel = 150;
    const level = Math.floor(xp / xpPerLevel) + 1;
    const currentLevelXP = xp % xpPerLevel;
    const progressPercent = Math.min(100, Math.floor((currentLevelXP / xpPerLevel) * 100));
    return { level, progressPercent, remaining: xpPerLevel - currentLevelXP };
  };

  return (
    <div className="paper-card bg-white p-6 border-2 border-purple-200">
      <div className="mb-4">
        <h3 className="font-caveat text-3xl font-bold text-purple-900 flex items-center gap-2">
          🏆 Family Leaderboard
        </h3>
        <p className="text-xs text-purple-500 font-medium font-sans">
          Who's leading the charts in chores and goals this week? Earn XP to rank up!
        </p>
      </div>

      <div className="space-y-4">
        {sortedMembers.map((member, index) => {
          const { level, progressPercent, remaining } = calculateLevelProgress(member.xp);
          const badges = getBadges(member.xp);

          // Placement indicators
          let rankIcon = null;
          let rankBg = "bg-purple-50 border-purple-100";
          if (index === 0) {
            rankIcon = <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />;
            rankBg = "bg-amber-50/50 border-amber-200";
          } else if (index === 1) {
            rankIcon = <Medal className="w-5 h-5 text-slate-400" />;
            rankBg = "bg-slate-50/50 border-slate-200";
          } else if (index === 2) {
            rankIcon = <Award className="w-5 h-5 text-amber-700" />;
            rankBg = "bg-orange-50/30 border-orange-200";
          }

          return (
            <div 
              key={member.uid} 
              className={`p-4 border-2 rounded-2xl transition-all ${rankBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              {/* Left Column: Rank + Avatar + Name */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center font-caveat text-xl font-extrabold text-purple-700">
                  {rankIcon ? rankIcon : index + 1}
                </div>
                
                <span className="text-3xl filter drop-shadow-sm">{member.avatarEmoji}</span>
                
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans font-bold text-purple-950 text-sm">{member.displayName}</span>
                    <span className="text-[10px] bg-purple-200 text-purple-800 font-bold px-1.5 py-0.5 rounded-full">
                      {member.role}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {badges.map((b) => (
                      <span key={b.name} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${b.color}`}>
                        {b.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Gamification progress bar */}
              <div className="flex-1 max-w-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-purple-800">
                  <span className="flex items-center gap-1 font-caveat text-base">
                    <Star className="w-4 h-4 text-purple-500 fill-purple-300" />
                    Level {level}
                  </span>
                  <span>{member.xp} XP</span>
                </div>
                
                {/* Custom Hand-Drawn Styled Progress Bar */}
                <div className="w-full h-3 bg-purple-100 border border-purple-300 rounded-full overflow-hidden p-[2px]">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[9px] font-bold text-purple-400">
                  <span>{progressPercent}% Complete</span>
                  <span>{remaining} XP to next level</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
