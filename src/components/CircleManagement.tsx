import React, { useState } from 'react';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Circle, Task } from '../types';
import { Users, UserPlus, Sparkles, LogOut, ClipboardList } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface CircleManagementProps {
  userProfile: UserProfile;
  onCircleJoined: (circleId: string, circleName: string) => void;
  onLogout: () => void;
}

export default function CircleManagement({ userProfile, onCircleJoined, onLogout }: CircleManagementProps) {
  const [circleName, setCircleName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper to generate circular code
  const generateCircleCode = () => {
    const digits = Math.floor(100000 + Math.random() * 900000);
    return `FAM-${digits}`;
  };

  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!circleName.trim()) return;

    setLoading(true);
    try {
      const circleId = 'circle-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const code = generateCircleCode();

      const newCircle: Circle = {
        id: circleId,
        name: circleName.trim(),
        code,
        createdById: userProfile.uid,
        createdAt: new Date().toISOString()
      };

      // 1. Save Circle document
      await setDoc(doc(db, 'circles', circleId), newCircle);

      // 2. Update user profile circle ID
      await updateDoc(doc(db, 'users', userProfile.uid), {
        circleId: circleId
      });

      // 3. Auto-seed some standard sample chores so the list isn't blank
      await seedSampleChores(circleId, userProfile.uid);

      soundEffects.playLevelUp();
      setSuccess(`Success! Circle "${newCircle.name}" created with code: ${code}`);
      
      setTimeout(() => {
        onCircleJoined(circleId, newCircle.name);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create family circle.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const formattedCode = inviteCode.trim().toUpperCase();
    if (!formattedCode) return;

    setLoading(true);
    try {
      // Query circles for this code
      const circlesRef = collection(db, 'circles');
      const q = query(circlesRef, where('code', '==', formattedCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('No family circle found with that code! Double check and try again.');
      }

      const circleDoc = querySnapshot.docs[0];
      const circleData = circleDoc.data() as Circle;

      // Update user's profile with this circle ID
      await updateDoc(doc(db, 'users', userProfile.uid), {
        circleId: circleData.id
      });

      soundEffects.playChime();
      setSuccess(`Awesome! You have joined "${circleData.name}"`);
      
      setTimeout(() => {
        onCircleJoined(circleData.id, circleData.name);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to join family circle.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-populate some chores so families get value immediately
  const seedSampleChores = async (circleId: string, uid: string) => {
    const chores: Omit<Task, 'id'>[] = [
      {
        title: '🧹 Clean the Living Room',
        description: 'Tidy up the toys, dust the shelves, and vacuum the rug.',
        category: 'Chore',
        frequency: 'Daily',
        assignedTo: [uid],
        timeOfDay: '17:00',
        xpReward: 15,
        difficulty: 'Medium',
        status: 'Pending',
        streak: 0,
        createdById: uid,
        createdAt: new Date().toISOString()
      },
      {
        title: '🌱 Water the Chores & Houseplants',
        description: 'Give water to the ferns and balcony flowers.',
        category: 'Routine',
        frequency: 'Daily',
        assignedTo: [uid],
        timeOfDay: '09:00',
        xpReward: 10,
        difficulty: 'Easy',
        status: 'Pending',
        streak: 0,
        createdById: uid,
        createdAt: new Date().toISOString()
      },
      {
        title: '🏃‍♂️ Morning Stretching & Core Exercises',
        description: '15 minutes of dynamic stretches and planks to stay agile.',
        category: 'Exercise',
        frequency: 'Daily',
        assignedTo: [uid],
        timeOfDay: '08:00',
        xpReward: 20,
        difficulty: 'Medium',
        status: 'Pending',
        streak: 0,
        createdById: uid,
        createdAt: new Date().toISOString()
      },
      {
        title: '🍕 Family Dinner Night Cooking',
        description: 'Help prepare delicious pizza or pasta for family dinner.',
        category: 'Routine',
        frequency: 'Weekly',
        assignedTo: [uid],
        timeOfDay: '18:30',
        xpReward: 30,
        difficulty: 'Medium',
        status: 'Pending',
        streak: 0,
        createdById: uid,
        createdAt: new Date().toISOString()
      },
      {
        title: '📚 Complete Homework Assignment',
        description: 'Spend 1 hour review and submit academic exercises.',
        category: 'Goal',
        frequency: 'Weekly',
        assignedTo: [uid],
        timeOfDay: '16:00',
        xpReward: 40,
        difficulty: 'Hard',
        status: 'Pending',
        streak: 0,
        createdById: uid,
        createdAt: new Date().toISOString()
      },
      {
        title: '🚗 Vacuum and Wash the Family Car',
        description: 'Full inside vacuuming and sparkling external bubble wash.',
        category: 'Chore',
        frequency: 'Monthly',
        assignedTo: [uid],
        timeOfDay: '11:00',
        xpReward: 60,
        difficulty: 'Hard',
        status: 'Pending',
        streak: 0,
        createdById: uid,
        createdAt: new Date().toISOString()
      }
    ];

    for (const chore of chores) {
      const taskId = 'task-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      await setDoc(doc(db, 'circles', circleId, 'tasks', taskId), {
        ...chore,
        id: taskId
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-8">
      <div className="w-full max-w-lg paper-card bg-white p-8 border-2 border-purple-200 space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="font-caveat text-4xl font-bold text-purple-900">
            Welcome, {userProfile.displayName}! {userProfile.avatarEmoji}
          </h2>
          <p className="text-sm font-medium text-purple-500 mt-1">
            To get started, create a family circle or join an existing one using an invite code.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
            ✨ {success}
          </div>
        )}

        {/* Create and Join Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          
          {/* Create Circle */}
          <form onSubmit={handleCreateCircle} className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-800 font-bold">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-sans text-base">Create New Circle</span>
              </div>
              <p className="text-xs text-purple-500">
                Start a fresh house chore list and invite family members later.
              </p>
              <div>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Smiths Circle"
                  className="w-full px-4 py-2 bg-purple-50/50 border-2 border-purple-100 rounded-xl focus:border-purple-300 focus:outline-none font-sans font-medium text-purple-900 text-sm"
                  value={circleName}
                  onChange={(e) => setCircleName(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-purple-600 hover:bg-purple-700 active:translate-y-0.5 text-white font-bold rounded-xl text-sm shadow transition-all cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Family Circle 🚀'}
            </button>
          </form>

          {/* Divider */}
          <div className="block md:hidden border-t-2 border-dashed border-purple-100 my-2"></div>

          {/* Join Circle */}
          <form onSubmit={handleJoinCircle} className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-800 font-bold">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <span className="font-sans text-base">Join Family Circle</span>
              </div>
              <p className="text-xs text-purple-500">
                Enter an invitation code (like FAM-123456) shared by your family.
              </p>
              <div>
                <input
                  type="text"
                  required
                  placeholder="FAM-123456"
                  className="w-full px-4 py-2 bg-purple-50/50 border-2 border-purple-100 rounded-xl focus:border-purple-300 focus:outline-none font-sans font-medium text-purple-900 text-sm uppercase"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-white border-2 border-purple-500 hover:bg-purple-50 text-purple-700 font-bold rounded-xl text-sm transition-all cursor-pointer"
            >
              {loading ? 'Joining...' : 'Join with Code 🔑'}
            </button>
          </form>

        </div>

        {/* Sign Out Link */}
        <div className="pt-6 border-t border-purple-100 flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 text-purple-400">
            <ClipboardList className="w-4 h-4" />
            <span>Light Purple Handdrawn Theme</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 text-purple-600 font-bold hover:underline cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
