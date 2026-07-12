import { TaskLog } from '../types';
import { Calendar, CheckCircle2, History } from 'lucide-react';

interface DoodleFeedProps {
  logs: TaskLog[];
}

export default function DoodleFeed({ logs }: DoodleFeedProps) {
  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="paper-card bg-[#fffdf6] p-6 border-2 border-purple-200">
      
      <div className="mb-4">
        <h3 className="font-caveat text-3xl font-bold text-purple-900 flex items-center gap-2">
          📜 Family Log & Live Feed
        </h3>
        <p className="text-xs text-purple-500 font-medium font-sans">
          See recent task achievements and chore checkouts from your loved ones.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="doodle-border-dashed p-6 text-center rounded-2xl text-purple-400 font-medium text-xs">
          <History className="w-8 h-8 text-purple-300 mx-auto mb-2 animate-pulse" />
          No chore logs recorded yet. Complete a task to start the feed!
        </div>
      ) : (
        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="sticky-note p-3 rounded-xl border-l-4 border-purple-400 bg-purple-50/20 flex items-start gap-3 relative"
            >
              <div className="text-2xl filter drop-shadow-sm mt-0.5">{log.completedByEmoji}</div>
              
              <div className="flex-1 space-y-0.5">
                <div className="text-xs font-bold text-purple-950">
                  <span className="text-purple-700">{log.completedByName}</span> completed{' '}
                  <span className="underline decoration-dashed decoration-purple-300">{log.taskTitle}</span>!
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400">
                  <span className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded">
                    {log.taskCategory}
                  </span>
                  <span>+{log.xpAwarded} XP awarded</span>
                </div>
              </div>

              <div className="text-[9px] font-bold text-purple-400 whitespace-nowrap self-center font-mono">
                {formatDate(log.completedAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
