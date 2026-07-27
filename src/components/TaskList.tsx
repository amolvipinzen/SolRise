import React, { useState, useEffect } from 'react';
import { Task, UserProfile, TaskCategory, TaskFrequency } from '../types';
import {
  Trash2,
  Clock,
  Calendar,
  Star,
  Sparkles,
  CheckCircle,
  Plus,
  Pencil,
  Heart,
  Check,
  LayoutGrid,
  Circle
} from 'lucide-react';
import lavenderImg from '../lavender.png';
import { soundEffects } from '../utils/audio';

// Deluxe iOS-style single botanical lavender sprig component using the custom asset image
export const LavenderSprig = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`${className} relative overflow-hidden shrink-0`}>
    <img 
      src={lavenderImg} 
      alt="Lavender Sprig" 
      className="absolute max-w-none h-full w-[170%] left-[-62%] top-0 object-contain" 
    />
  </div>
);
// soundEffects utility is imported and used below

// Potted/blooming lavender graphic matching the completed task progress
interface LavenderBloomProps {
  progress: number;
  className?: string;
}

const LavenderBloom = ({ progress, className = "w-16 h-16" }: LavenderBloomProps) => {
  // Determine blooming stage based on progress percentage
  if (progress < 25) {
    // Stage 1 (0% - 24%): Sprout (as per user image)
    return (
      <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Grey soil base ellipse */}
        <ellipse cx="40" cy="90" rx="16" ry="3.5" fill="#7E7D82" stroke="#4B4B4E" strokeWidth="1.5" />
        
        {/* Main green stem */}
        <path d="M40 90 C39 70 39 52 40 38" stroke="#7E9B80" strokeWidth="3" strokeLinecap="round" />
        
        {/* Two green leaves growing from Y=70 */}
        <path d="M40 70 C24 64 26 50 22 44 C27 48 35 62 40 70 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1.5" />
        <path d="M40 70 C56 64 54 50 58 44 C53 48 45 62 40 70 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1.5" />
        
        {/* Left and Right Sepals */}
        <path d="M40 38 C35 36 36 32 38 32 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1.2" />
        <path d="M40 38 C45 36 44 32 42 32 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1.2" />

        {/* Stacked buds (Bottom to Top) */}
        {/* Bottom Center */}
        <path d="M40 36 C36.5 36 36.5 30 40 27 C43.5 30 43.5 36 40 36 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1.2" />
        {/* Left-1 */}
        <path d="M37 32 C33.5 32 33.5 27 37 24 C40.5 27 40.5 32 37 32 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1.2" />
        {/* Right-1 */}
        <path d="M43 32 C46.5 32 46.5 27 43 24 C39.5 27 39.5 32 43 32 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1.2" />
        {/* Center-2 */}
        <path d="M40 28 C36.5 28 36.5 22 40 19 C43.5 22 43.5 28 40 28 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1.2" />
        {/* Left-2 */}
        <path d="M37 24 C33.5 24 33.5 19 37 16 C40.5 19 40.5 24 37 24 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1.2" />
        {/* Right-2 */}
        <path d="M43 24 C46.5 24 46.5 19 43 16 C39.5 19 39.5 24 43 24 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1.2" />
        {/* Center-top */}
        <path d="M40 19 C36.5 19 36.5 14 40 10 C43.5 14 43.5 19 40 19 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1.2" />
      </svg>
    );
  } else if (progress < 50) {
    // Stage 2 (25% - 49%): 3-stem Plant (as per user image)
    return (
      <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Dark soil base ellipse */}
        <ellipse cx="40" cy="90" rx="14" ry="2.5" fill="#1F1B2C" />
        
        {/* Main green stems */}
        <path d="M40 90 Q39 65 40 42" stroke="#7E9B80" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M40 90 Q35 70 28 55" stroke="#7E9B80" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40 90 Q46 68 53 50" stroke="#7E9B80" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Rising leaves from base */}
        <path d="M40 85 C24 80 18 68 20 62 C24 62 34 76 40 85 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1.2" />
        <path d="M40 85 C56 80 62 68 60 62 C56 62 46 76 40 85 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1.2" />
        <path d="M40 85 C32 72 32 54 35 48 C37 48 38 68 40 85 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1.2" />
        <path d="M40 85 C48 72 48 54 45 48 C43 48 42 68 40 85 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1.2" />
        <path d="M40 85 C34 76 34 60 36 52 C38 52 38 72 40 85 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1.2" />
        <path d="M40 85 C46 76 46 60 44 52 C42 52 42 72 40 85 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1.2" />
        <path d="M40 85 C38 70 38 56 39 48 C40 48 40 68 40 85 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1.2" />
        <path d="M40 85 C42 70 42 56 41 48 C40 48 40 68 40 85 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1.2" />

        {/* --- LEFT STEM FLOWER SPIKE --- */}
        <path d="M28 55 L21 30" stroke="#7E9B80" strokeWidth="2" />
        {/* Left side node */}
        <path d="M28 48 C24 48 24 45 28 44 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M28 48 C32 48 32 45 28 44 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        {/* Left stalk buds */}
        <path d="M28 53 C24.5 53 24.5 48 28 45 C31.5 48 31.5 53 28 53 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M25 49 C21.5 49 21.5 44 25 41 C28.5 44 28.5 49 25 49 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M31 49 C27.5 49 27.5 44 31 41 C34.5 44 34.5 49 31 49 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M27 45 C23.5 45 23.5 40 27 37 C30.5 40 30.5 45 27 45 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M23 41 C19.5 41 19.5 36 23 33 C26.5 36 26.5 41 23 41 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M29 41 C25.5 41 25.5 36 29 33 C32.5 36 32.5 41 29 41 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M25 37 C21.5 37 21.5 32 25 29 C28.5 32 28.5 37 25 37 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M23 31 C19.5 31 19.5 27 23 24 C26.5 27 26.5 31 23 31 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />

        {/* --- RIGHT STEM FLOWER SPIKE --- */}
        <path d="M53 50 L60 25" stroke="#7E9B80" strokeWidth="2" />
        {/* Right side node */}
        <path d="M57 42 C53 42 53 39 57 38 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M57 42 C61 42 61 39 57 38 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        {/* Right stalk buds */}
        <path d="M54 48 C50.5 48 50.5 43 54 40 C57.5 43 57.5 48 54 48 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M51 44 C47.5 44 47.5 39 51 36 C54.5 39 54.5 44 51 44 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M57 44 C53.5 44 53.5 39 57 36 C60.5 39 60.5 44 57 44 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M55 40 C51.5 40 51.5 35 55 32 C58.5 35 58.5 40 55 40 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M52 36 C48.5 36 48.5 31 52 28 C55.5 31 55.5 36 52 36 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M58 36 C54.5 36 54.5 31 58 28 C61.5 31 61.5 36 58 36 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M56 32 C52.5 32 52.5 27 56 24 C59.5 27 59.5 32 56 32 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M58 26 C54.5 26 54.5 22 58 19 C61.5 22 61.5 26 58 26 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />

        {/* --- CENTRAL STEM FLOWER SPIKE --- */}
        <path d="M40 42 L40 10" stroke="#7E9B80" strokeWidth="2.2" />
        {/* Sepals */}
        <path d="M40 42 C36 40 37 36 39 36 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1.2" />
        <path d="M40 42 C44 40 43 36 41 36 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1.2" />
        {/* Stacked buds */}
        <path d="M40 40 C36.5 40 36.5 34 40 31 C43.5 34 43.5 40 40 40 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1.2" />
        <path d="M37 36 C33.5 36 33.5 30 37 27 C40.5 30 40.5 36 37 36 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1.2" />
        <path d="M43 36 C46.5 36 46.5 30 43 27 C39.5 30 39.5 36 43 36 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1.2" />
        <path d="M40 32 C36.5 32 36.5 26 40 23 C43.5 26 43.5 32 40 32 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1.2" />
        <path d="M37 28 C33.5 28 33.5 22 37 19 C40.5 22 40.5 28 37 28 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1.2" />
        <path d="M43 28 C46.5 28 46.5 22 43 19 C39.5 22 39.5 28 43 28 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1.2" />
        <path d="M40 24 C36.5 24 36.5 18 40 15 C43.5 18 43.5 24 40 24 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1.2" />
        <path d="M37 20 C33.5 20 33.5 14 37 11 C40.5 14 40.5 20 37 20 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1.2" />
        <path d="M43 20 C46.5 20 46.5 14 43 11 C39.5 14 39.5 20 43 20 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1.2" />
        <path d="M40 16 C36.5 16 36.5 11 40 8 C43.5 11 43.5 16 40 16 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1.2" />
        <path d="M40 9 C37.5 9 37.5 5 40 2 C42.5 5 42.5 9 40 9 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1.2" />
      </svg>
    );
  } else if (progress < 75) {
    // Stage 3 (50% - 74%): Medium Bushy Plant (as per user image)
    return (
      <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Main green stems */}
        <path d="M40 90 L40 38" stroke="#7E9B80" strokeWidth="3" />
        <path d="M40 90 Q34 65 27 45" stroke="#7E9B80" strokeWidth="2.2" />
        <path d="M40 90 Q46 65 53 45" stroke="#7E9B80" strokeWidth="2.2" />
        
        {/* Bushy foliage - dome of overlapping leaves at the base */}
        {/* Layer 1 (Darker Green Base Leaves) */}
        <path d="M40 90 C30 92 20 85 15 80 C18 76 28 80 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C50 92 60 85 65 80 C62 76 52 80 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C25 85 12 75 14 65 C18 64 28 75 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C55 85 68 75 66 65 C62 64 52 75 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C28 78 18 64 22 55 C26 56 34 72 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C52 78 62 64 58 55 C54 56 46 72 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C34 75 32 55 35 48 C37 50 38 72 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C46 75 48 55 45 48 C43 50 42 72 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        
        {/* Layer 2 (Lighter Green Overlay Leaves) */}
        <path d="M40 90 C30 85 24 72 30 65 C34 66 36 78 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C50 85 56 72 50 65 C46 66 44 78 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C37 80 34 68 38 60 C40 61 40 76 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C43 80 46 68 42 60 C40 61 40 76 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C32 88 26 80 32 75 C35 76 37 82 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C48 88 54 80 48 75 C45 76 43 82 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />
        
        {/* --- LEFT STEM FLOWER SPIKE (Y=45 to Y=18, slanting left) --- */}
        <path d="M27 45 L20 18" stroke="#7E9B80" strokeWidth="2.0" />
        {/* Sepals and spaced buds */}
        <path d="M27 45 C23 45 23 41 26 39 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M27 45 C29 43 30 40 27 38 L25 41 Z" fill="#7E9B80" />
        
        <path d="M25 41 C21.5 41 21.5 37 24 34 C26.5 36 26.5 40 25 41 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M28 39 C25 39 25 35 27 32 C29.5 34 29.5 38 28 39 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        
        <path d="M23 35 C19.5 35 19.5 31 22 28 C24.5 30 24.5 34 23 35 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M26 33 C23 33 23 29 25 26 C27.5 28 27.5 32 26 33 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        
        <path d="M21 29 C18 29 18 25 20 22 C22 24 22 28 21 29 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />
        <path d="M24 27 C21 27 21 23 23 20 C25 22 25 26 24 27 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />
        {/* Top left sepal and bud */}
        <path d="M20 20 C18 20 18 16 20 13 C22 15 22 19 20 20 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />
        <path d="M20 15 C19 12 19 10 20 9 C20.5 10 21 12 20 15 Z" fill="#7E9B80" />

        {/* --- RIGHT STEM FLOWER SPIKE (Y=45 to Y=18, slanting right) --- */}
        <path d="M53 45 L60 18" stroke="#7E9B80" strokeWidth="2.0" />
        {/* Sepals and spaced buds */}
        <path d="M53 45 C57 45 57 41 54 39 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M53 45 C51 43 50 40 53 38 L55 41 Z" fill="#7E9B80" />
        
        <path d="M55 41 C58.5 41 58.5 37 56 34 C53.5 36 53.5 40 55 41 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M52 39 C55 39 55 35 53 32 C50.5 34 50.5 38 52 39 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        
        <path d="M57 35 C60.5 35 60.5 31 58 28 C55.5 30 55.5 34 57 35 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M54 33 C57 33 57 29 55 26 C52.5 28 52.5 32 54 33 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        
        <path d="M59 29 C62 29 62 25 60 22 C58 24 58 28 59 29 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />
        <path d="M56 27 C59 27 59 23 57 20 C55 22 55 26 56 27 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />
        {/* Top right sepal and bud */}
        <path d="M60 20 C62 20 62 16 60 13 C58 15 58 19 60 20 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />
        <path d="M60 15 C61 12 61 10 60 9 C59.5 10 59 12 60 15 Z" fill="#7E9B80" />

        {/* --- CENTRAL STEM FLOWER SPIKE (Y=38 to Y=8) --- */}
        {/* Sepal and Bud Level 1 */}
        <path d="M37 36 C34 36 33 32 37 29 C40 31 39 36 37 36 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M43 36 C46 36 47 32 43 29 C40 31 41 36 43 36 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M40 38 L40 33" stroke="#7E9B80" strokeWidth="1.5" />
        
        {/* Sepal and Bud Level 2 */}
        <path d="M37 30 C34 30 33 26 37 23 C40 25 39 30 37 30 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M43 30 C46 30 47 26 43 23 C40 25 41 30 43 30 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M40 31 L40 27" stroke="#7E9B80" strokeWidth="1.5" />
        
        {/* Sepal and Bud Level 3 */}
        <path d="M37 24 C34 24 33 20 37 17 C40 19 39 24 37 24 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M43 24 C46 24 47 20 43 17 C40 19 41 24 43 24 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M40 25 L40 21" stroke="#7E9B80" strokeWidth="1.5" />
        
        {/* Sepal and Bud Level 4 */}
        <path d="M37 18 C34 18 33 14 37 11 C40 13 39 18 37 18 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M43 18 C46 18 47 14 43 11 C40 13 41 18 43 18 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M40 19 L40 15" stroke="#7E9B80" strokeWidth="1.5" />
        
        {/* Sepal and Bud Level 5 (Top Cluster) */}
        <path d="M40 12 C37.5 12 37.5 8 40 4 C42.5 8 42.5 12 40 12 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />
        <path d="M39 12 C37 8 38 4 39 3 C40 5 40 8 39 12 Z" fill="#7E9B80" />
        <path d="M41 12 C43 8 42 4 41 3 C40 5 40 8 41 12 Z" fill="#7E9B80" />
      </svg>
    );
  } else if (progress < 100) {
    // Stage 4 (75% - 99%): Large Bushy Plant (as per user image)
    return (
      <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Main green stems */}
        <path d="M40 90 L40 42" stroke="#7E9B80" strokeWidth="3" />
        <path d="M40 90 Q34 68 31 46" stroke="#7E9B80" strokeWidth="2.5" />
        <path d="M40 90 Q46 68 49 46" stroke="#7E9B80" strokeWidth="2.5" />
        <path d="M40 90 Q30 72 23 54" stroke="#7E9B80" strokeWidth="2" />
        <path d="M40 90 Q50 72 57 54" stroke="#7E9B80" strokeWidth="2" />
        
        {/* Bushy foliage - dome of overlapping leaves at the base */}
        {/* Layer 1 (Darker Green Base Leaves) */}
        <path d="M40 90 C30 92 18 85 12 78 C15 74 26 78 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C50 92 62 85 68 78 C65 74 54 78 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C22 84 10 72 12 60 C17 59 27 72 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C58 84 70 72 68 60 C63 59 53 72 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C26 74 16 58 20 48 C24 50 32 68 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C54 74 64 58 60 48 C56 50 48 68 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C33 72 30 52 33 44 C35 46 37 66 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C47 72 50 52 47 44 C45 46 43 66 40 90 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="1" />
        
        {/* Layer 2 (Lighter Green Overlay Leaves) */}
        <path d="M40 90 C28 85 22 70 28 62 C32 63 34 75 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C52 85 58 70 52 62 C48 63 46 75 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C35 78 32 64 36 56 C38 57 38 72 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C45 78 48 64 44 56 C42 57 42 72 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C31 89 25 80 30 72 C33 73 35 80 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C49 89 55 80 50 72 C47 73 45 80 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C38 70 36 54 38 46 C39 46 40 64 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />
        <path d="M40 90 C42 70 44 54 42 46 C41 46 40 64 40 90 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="1" />

        {/* --- OUTER LEFT STEM FLOWER SPIKE (Y=54 to Y=25, tilted left) --- */}
        <path d="M23 54 L15 28" stroke="#7E9B80" strokeWidth="1.8" />
        <path d="M23 53 C19.5 53 19.5 48 23 45 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M20 49 C16.5 49 16.5 44 20 41 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M26 49 C22.5 49 22.5 44 26 41 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M22 45 C18.5 45 18.5 40 22 37 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M18 41 C14.5 41 14.5 36 18 33 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M24 41 C20.5 41 20.5 36 24 33 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M20 37 C16.5 37 16.5 32 20 29 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M18 31 C14.5 31 14.5 27 18 24 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />

        {/* --- INNER LEFT STEM FLOWER SPIKE (Y=46 to Y=18, slanting left) --- */}
        <path d="M31 46 L24 20" stroke="#7E9B80" strokeWidth="2.0" />
        <path d="M31 45 C27.5 45 27.5 40 31 37 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M28 41 C24.5 41 24.5 36 28 33 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M34 41 C30.5 41 30.5 36 34 33 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M30 37 C26.5 37 26.5 32 30 29 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M26 33 C22.5 33 22.5 29 26 26 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M32 33 C28.5 33 28.5 29 32 26 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M28 29 C24.5 29 24.5 25 28 22 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />
        <path d="M26 23 C22.5 23 22.5 19 26 16 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />

        {/* --- OUTER RIGHT STEM FLOWER SPIKE (Y=54 to Y=25, tilted right) --- */}
        <path d="M57 54 L65 28" stroke="#7E9B80" strokeWidth="1.8" />
        <path d="M57 53 C53.5 53 53.5 48 57 45 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M54 49 C50.5 49 50.5 44 54 41 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M60 49 C56.5 49 56.5 44 60 41 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M58 45 C54.5 45 54.5 40 58 37 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M56 41 C52.5 41 52.5 36 56 33 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M62 41 C58.5 41 58.5 36 62 33 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M60 37 C56.5 37 56.5 32 60 29 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M62 31 C58.5 31 58.5 27 62 24 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />

        {/* --- INNER RIGHT STEM FLOWER SPIKE (Y=46 to Y=18, slanting right) --- */}
        <path d="M49 46 L56 20" stroke="#7E9B80" strokeWidth="2.0" />
        <path d="M49 45 C45.5 45 45.5 40 49 37 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M46 41 C42.5 41 42.5 36 46 33 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M52 41 C48.5 41 48.5 36 52 33 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M50 37 C46.5 37 46.5 32 50 29 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M46 33 C42.5 33 42.5 29 46 26 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M52 33 C48.5 33 48.5 29 52 26 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M52 29 C48.5 29 48.5 25 52 22 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />
        <path d="M54 23 C50.5 23 50.5 19 54 16 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />

        {/* --- CENTRAL STEM FLOWER SPIKE (Y=38 to Y=8) --- */}
        <path d="M40 42 L40 10" stroke="#7E9B80" strokeWidth="2.2" />
        {/* Red detail at base of central stalk (resembling butterfly/special sepals) */}
        <path d="M37 41 Q36 38 40 40 Q44 38 43 41 Q40 43 37 41 Z" fill="#B03A2E" stroke="#5C1D16" strokeWidth="0.8" />
        
        {/* Sepal and Bud Level 1 */}
        <path d="M37 36 C34 36 33 32 37 29 C40 31 39 36 37 36 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M43 36 C46 36 47 32 43 29 C40 31 41 36 43 36 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M40 38 L40 33" stroke="#7E9B80" strokeWidth="1.5" />
        
        {/* Sepal and Bud Level 2 */}
        <path d="M37 30 C34 30 33 26 37 23 C40 25 39 30 37 30 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M43 30 C46 30 47 26 43 23 C40 25 41 30 43 30 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M40 31 L40 27" stroke="#7E9B80" strokeWidth="1.5" />
        
        {/* Sepal and Bud Level 3 */}
        <path d="M37 24 C34 24 33 20 37 17 C40 19 39 24 37 24 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M43 24 C46 24 47 20 43 17 C40 19 41 24 43 24 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M40 25 L40 21" stroke="#7E9B80" strokeWidth="1.5" />
        
        {/* Sepal and Bud Level 4 */}
        <path d="M37 18 C34 18 33 14 37 11 C40 13 39 18 37 18 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M43 18 C46 18 47 14 43 11 C40 13 41 18 43 18 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M40 19 L40 15" stroke="#7E9B80" strokeWidth="1.5" />
        
        {/* Sepal and Bud Level 5 (Top Cluster) */}
        <path d="M40 12 C37.5 12 37.5 8 40 4 C42.5 8 42.5 12 40 12 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />
        <path d="M39 12 C37 8 38 4 39 3 C40 5 40 8 39 12 Z" fill="#7E9B80" />
        <path d="M41 12 C43 8 42 4 41 3 C40 5 40 8 41 12 Z" fill="#7E9B80" />
      </svg>
    );
  } else {
    // Stage 5 (100%): Fully Potted Blooming Lavender with Ribbon & Butterflies (as per user image)
    return (
      <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* --- POT & SOIL --- */}
        {/* Pot Body */}
        <path d="M24 64 L27 88 C28 91 30 93 34 93 L46 93 C50 93 52 91 53 88 L56 64 Z" fill="#E2D9F8" stroke="#9D82F2" strokeWidth="1.5" />
        {/* Soil Base */}
        <ellipse cx="40" cy="62" rx="16.5" ry="2.5" fill="#3B2E2A" />
        {/* Pot Rim */}
        <path d="M22 59 L58 59 C59.5 59 60 61 58 64 L22 64 C20 61 20.5 59 22 59 Z" fill="#D2C5FA" stroke="#9D82F2" strokeWidth="1.2" />

        {/* Ribbon & Ribbon Bow on Pot */}
        <rect x="25" y="70" width="30" height="4" fill="#9D82F2" opacity="0.9" />
        <path d="M25 72 L55 72" stroke="#E2D9F8" strokeWidth="0.8" strokeDasharray="2,2" />
        {/* Bow Knot */}
        <rect x="38.5" y="69.5" width="3" height="5" rx="1" fill="#7A63D4" stroke="#4E3B9B" strokeWidth="0.5" />
        {/* Bow Loops */}
        <path d="M38.5 72 C34 68 34 76 38.5 72 Z" fill="#9D82F2" stroke="#684FB7" strokeWidth="0.8" />
        <path d="M41.5 72 C46 68 46 76 41.5 72 Z" fill="#9D82F2" stroke="#684FB7" strokeWidth="0.8" />
        {/* Bow Tails */}
        <path d="M38.5 73 L35 79" stroke="#9D82F2" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M41.5 73 L45 79" stroke="#9D82F2" strokeWidth="1.5" strokeLinecap="round" />

        {/* --- BACKGROUND STEMS & SPIKES (Lighter & Translucent Y=58 to 22) --- */}
        <g opacity="0.45">
          {/* Back Left Spike */}
          <path d="M32 60 L24 30" stroke="#7E9B80" strokeWidth="1.5" />
          <circle cx="24" cy="30" r="2.5" fill="#BFAEF8" />
          <circle cx="26" cy="34" r="2" fill="#BFAEF8" />
          <circle cx="22" cy="35" r="2" fill="#BFAEF8" />
          <circle cx="24" cy="39" r="2.5" fill="#BFAEF8" />
          {/* Back Right Spike */}
          <path d="M48 60 L56 30" stroke="#7E9B80" strokeWidth="1.5" />
          <circle cx="56" cy="30" r="2.5" fill="#BFAEF8" />
          <circle cx="54" cy="34" r="2" fill="#BFAEF8" />
          <circle cx="58" cy="34" r="2" fill="#BFAEF8" />
          <circle cx="56" cy="39" r="2.5" fill="#BFAEF8" />
          {/* Back Center-Left */}
          <path d="M36 60 L32 24" stroke="#7E9B80" strokeWidth="1.5" />
          <circle cx="32" cy="24" r="2.5" fill="#AC94F2" />
          <circle cx="30" cy="28" r="2" fill="#AC94F2" />
          <circle cx="34" cy="28" r="2" fill="#AC94F2" />
          <circle cx="32" cy="32" r="2.5" fill="#AC94F2" />
          {/* Back Center-Right */}
          <path d="M44 60 L48 24" stroke="#7E9B80" strokeWidth="1.5" />
          <circle cx="48" cy="24" r="2.5" fill="#AC94F2" />
          <circle cx="46" cy="28" r="2" fill="#AC94F2" />
          <circle cx="50" cy="28" r="2" fill="#AC94F2" />
          <circle cx="48" cy="32" r="2.5" fill="#AC94F2" />
        </g>

        {/* --- FOREGROUND STEMS --- */}
        <path d="M40 60 L40 38" stroke="#7E9B80" strokeWidth="2.8" />
        <path d="M40 60 Q34 45 28 32" stroke="#7E9B80" strokeWidth="2.2" />
        <path d="M40 60 Q46 45 52 32" stroke="#7E9B80" strokeWidth="2.2" />
        <path d="M40 60 Q28 48 20 38" stroke="#7E9B80" strokeWidth="1.8" />
        <path d="M40 60 Q52 48 60 38" stroke="#7E9B80" strokeWidth="1.8" />

        {/* --- DENSE FOLIAGE BASE --- */}
        {/* Layered dome of leaves spilling over pot rim */}
        <path d="M40 62 C30 64 20 58 16 55 C20 52 28 54 40 62 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="0.8" />
        <path d="M40 62 C50 64 60 58 64 55 C60 52 52 54 40 62 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="0.8" />
        <path d="M40 62 C26 56 16 48 20 42 C24 43 30 52 40 62 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="0.8" />
        <path d="M40 62 C54 56 64 48 60 42 C56 43 50 52 40 62 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="0.8" />
        <path d="M40 62 C34 50 32 38 35 34 C37 35 38 48 40 62 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="0.8" />
        <path d="M40 62 C46 50 48 38 45 34 C43 35 42 48 40 62 Z" fill="#7E9B80" stroke="#4E6550" strokeWidth="0.8" />
        {/* Light Green Overlay Leaves */}
        <path d="M40 62 C28 58 24 48 28 42 C31 43 33 52 40 62 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="0.8" />
        <path d="M40 62 C52 58 56 48 52 42 C49 43 47 52 40 62 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="0.8" />
        <path d="M40 62 C35 52 33 42 36 38 C38 39 38 50 40 62 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="0.8" />
        <path d="M40 62 C45 52 47 42 44 38 C42 39 42 50 40 62 Z" fill="#9FBFA5" stroke="#4E6550" strokeWidth="0.8" />

        {/* --- FOREGROUND FLOWER SPIKES --- */}
        {/* 1. Outer Left (Y=38 to 18) */}
        <path d="M20 38 L14 18" stroke="#7E9B80" strokeWidth="1.5" />
        <path d="M20 37 C17.5 37 17.5 33 20 31 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M17 34 C14.5 34 14.5 30 17 28 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M21 34 C18.5 34 18.5 30 21 28 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M18 30 C15.5 30 15.5 26 18 24 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M15 26 C12.5 26 12.5 22 15 20 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />
        <path d="M19 26 C16.5 26 16.5 22 19 20 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />
        <path d="M16 22 C13.5 22 13.5 18 16 16 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />

        {/* 2. Inner Left (Y=32 to 12) */}
        <path d="M28 32 L22 12" stroke="#7E9B80" strokeWidth="1.8" />
        <path d="M28 31 C25 31 25 26 28 23 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M25 28 C22 28 22 23 25 20 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M29 28 C26 28 26 23 29 20 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M26 24 C23 24 23 20 26 17 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M23 20 C20 20 20 16 23 13 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />
        <path d="M27 20 C24 20 24 16 27 13 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />
        <path d="M24 16 C21 16 21 12 24 9 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />

        {/* 3. Outer Right (Y=38 to 18) */}
        <path d="M60 38 L66 18" stroke="#7E9B80" strokeWidth="1.5" />
        <path d="M60 37 C57.5 37 57.5 33 60 31 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M59 34 C56.5 34 56.5 30 59 28 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M63 34 C60.5 34 60.5 30 63 28 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M62 30 C59.5 30 59.5 26 62 24 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M61 26 C58.5 26 58.5 22 61 20 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />
        <path d="M65 26 C62.5 26 62.5 22 65 20 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />
        <path d="M64 22 C61.5 22 61.5 18 64 16 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />

        {/* 4. Inner Right (Y=32 to 12) */}
        <path d="M52 32 L58 12" stroke="#7E9B80" strokeWidth="1.8" />
        <path d="M52 31 C49 31 49 26 52 23 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M51 28 C48 28 48 23 51 20 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M55 28 C52 28 52 23 55 20 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="0.8" />
        <path d="M54 24 C51 24 51 20 54 17 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="0.8" />
        <path d="M53 20 C50 20 50 16 53 13 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />
        <path d="M57 20 C54 20 54 16 57 13 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />
        <path d="M56 16 C53 16 53 12 56 9 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.8" />

        {/* 5. Central Foreground (Y=38 to 6, tallest) */}
        <path d="M40 38 L40 6" stroke="#7E9B80" strokeWidth="2.2" />
        <path d="M40 36 C36.5 36 36.5 30 40 27 C43.5 30 43.5 36 40 36 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M37 32 C33.5 32 33.5 26 37 23 C40.5 26 40.5 32 37 32 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M43 32 C46.5 32 46.5 26 43 23 C39.5 26 39.5 32 43 32 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M40 28 C36.5 28 36.5 22 40 19 C43.5 22 43.5 28 40 28 Z" fill="#8E6FDF" stroke="#5C3FA3" strokeWidth="1" />
        <path d="M37 24 C33.5 24 33.5 18 37 15 C40.5 18 40.5 24 37 24 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M43 24 C46.5 24 46.5 18 43 15 C39.5 18 39.5 24 43 24 Z" fill="#AC94F2" stroke="#6C4FB7" strokeWidth="1" />
        <path d="M40 20 C36.5 20 36.5 15 40 12 C43.5 15 43.5 20 40 20 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />
        <path d="M40 12 C37 12 37 7 40 4 C43 7 43 12 40 12 Z" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="1" />

        {/* --- HOVERING BUTTERFLIES --- */}
        {/* Left Butterfly */}
        <g transform="translate(13, 35)">
          <path d="M 0 0 C -2 -2 -4 -1 -3 1 C -2 2 0 1 0 0" fill="#9D82F2" stroke="#684FB7" strokeWidth="0.5" />
          <path d="M 0 0 C 2 -2 4 -1 3 1 C 2 2 0 1 0 0" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.5" />
        </g>
        {/* Top-Right Butterfly */}
        <g transform="translate(67, 26)">
          <path d="M 0 0 C -2 -2 -4 -1 -3 1 C -2 2 0 1 0 0" fill="#9D82F2" stroke="#684FB7" strokeWidth="0.5" />
          <path d="M 0 0 C 2 -2 4 -1 3 1 C 2 2 0 1 0 0" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.5" />
        </g>
        {/* Middle-Right Butterfly */}
        <g transform="translate(72, 45)">
          <path d="M 0 0 C -2 -2 -4 -1 -3 1 C -2 2 0 1 0 0" fill="#9D82F2" stroke="#684FB7" strokeWidth="0.5" />
          <path d="M 0 0 C 2 -2 4 -1 3 1 C 2 2 0 1 0 0" fill="#BFAEF8" stroke="#7A63D4" strokeWidth="0.5" />
        </g>
      </svg>
    );
  }
};

interface TaskListProps {
  tasks: Task[];
  members: UserProfile[];
  currentUserId: string;
  onToggleComplete: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTaskClick?: () => void;
  onEditTaskClick?: (task: Task) => void;
  onReorderTasks?: (reorderedTasks: Task[]) => void;
}

export default function TaskList({
  tasks,
  members,
  currentUserId,
  onToggleComplete,
  onDeleteTask,
  onCreateTaskClick,
  onEditTaskClick,
  onReorderTasks
}: TaskListProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Pending'>('Pending');
  const [filterFrequency, setFilterFrequency] = useState<TaskFrequency | 'All'>('Daily');
  const [selectedMood, setSelectedMood] = useState<string | null>(() => {
    return localStorage.getItem('chore_book_mood') || null;
  });
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);
  const [recentlyCompletedIds, setRecentlyCompletedIds] = useState<string[]>([]);
  const [fadingOutIds, setFadingOutIds] = useState<string[]>([]);

  const handleToggleCompleteWithAnimation = (task: Task) => {
    const isPending = task.status === 'Pending';
    if (isPending && statusFilter === 'Pending') {
      const taskId = task.id;
      setRecentlyCompletedIds(prev => [...prev, taskId]);
      onToggleComplete(task);
      setTimeout(() => {
        setFadingOutIds(prev => [...prev, taskId]);
      }, 1400); // 1.4 seconds delay to let the slow strike-through complete
      setTimeout(() => {
        setRecentlyCompletedIds(prev => prev.filter(id => id !== taskId));
        setFadingOutIds(prev => prev.filter(id => id !== taskId));
      }, 2000); // 2.0 seconds total before unmounting
    } else {
      onToggleComplete(task);
    }
  };

  // Synchronize orderedTasks state with database tasks when not dragging
  useEffect(() => {
    if (!draggedTaskId) {
      setOrderedTasks(sortedFilteredTasks);
    }
  }, [tasks, filterFrequency, statusFilter, draggedTaskId, recentlyCompletedIds]);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    localStorage.setItem('chore_book_mood', mood);
    try {
      soundEffects.playChime();
    } catch (e) {
      // safe fallback
    }
  };

  // Find assignees as profile objects for list visualization
  const getAssigneeProfiles = (assigneeIds: string[]) => {
    return members.filter(m => assigneeIds.includes(m.uid));
  };

  // Drag and Drop Event Handlers (With Cross-Browser/Firefox compatibility & Optimistic UI updates)
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId); // Required for Firefox and some Chrome versions
  };

  const handleDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    if (draggedTaskId !== taskId) {
      setDragOverTaskId(taskId);
    }
  };

  const handleDragLeave = () => {
    setDragOverTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;

    // 1. Swap locally in orderedTasks for instant, fluid UI response
    const newOrderedTasks = [...orderedTasks];
    const localDraggedIdx = newOrderedTasks.findIndex(t => t.id === draggedTaskId);
    const localTargetIdx = newOrderedTasks.findIndex(t => t.id === targetTaskId);

    if (localDraggedIdx !== -1 && localTargetIdx !== -1) {
      const [draggedTask] = newOrderedTasks.splice(localDraggedIdx, 1);
      newOrderedTasks.splice(localTargetIdx, 0, draggedTask);
      setOrderedTasks(newOrderedTasks);
    }

    // 2. Prepare the fully updated global tasks array to commit to Firestore
    const allSortedTasks = [...tasks].sort((a, b) => {
      const orderA = a.order !== undefined && a.order !== null ? a.order : -1;
      const orderB = b.order !== undefined && b.order !== null ? b.order : -1;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const globalDraggedIdx = allSortedTasks.findIndex(t => t.id === draggedTaskId);
    const globalTargetIdx = allSortedTasks.findIndex(t => t.id === targetTaskId);

    if (globalDraggedIdx !== -1 && globalTargetIdx !== -1) {
      const [draggedTask] = allSortedTasks.splice(globalDraggedIdx, 1);
      allSortedTasks.splice(globalTargetIdx, 0, draggedTask);

      const updatedTasks = allSortedTasks.map((t, idx) => ({
        ...t,
        order: idx
      }));

      if (onReorderTasks) {
        onReorderTasks(updatedTasks);
      }
    }

    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  // Filter tasks based on selected filter options
  const filteredTasks = tasks.filter((task) => {
    const frequencyMatch = filterFrequency === 'All' || (task.frequency as string) === (filterFrequency as string);
    const isRecentlyCompletedInPendingTab = statusFilter === 'Pending' && 
      task.status === 'Completed' && 
      recentlyCompletedIds.includes(task.id);
    const statusMatch = statusFilter === 'All' || 
      (statusFilter === 'Completed' && task.status === 'Completed') ||
      (statusFilter === 'Pending' && (task.status === 'Pending' || isRecentlyCompletedInPendingTab));
    return frequencyMatch && statusMatch;
  });

  // Sort tasks in-memory by order asc, falling back to createdAt desc
  const sortedFilteredTasks = [...filteredTasks].sort((a, b) => {
    const orderA = a.order !== undefined && a.order !== null ? a.order : -1;
    const orderB = b.order !== undefined && b.order !== null ? b.order : -1;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Calculate completion percentage based on all tasks of this frequency (ignoring status tab)
  const tasksForProgress = tasks.filter((task) => {
    return filterFrequency === 'All' || (task.frequency as string) === (filterFrequency as string);
  });
  const totalCount = tasksForProgress.length;
  const completedCount = tasksForProgress.filter(t => t.status === 'Completed').length;
  const completionPercent = totalCount > 0 ? Math.floor((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">

      {/* Chore Frequency Tabs */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          {
            key: 'Daily',
            label: 'Daily',
            icon: (
              <div className="relative flex items-center justify-center">
                <span className="text-xl sm:text-2xl animate-pulse">☀️</span>
                <span className="absolute -top-1 -right-1 text-purple-400 text-[10px]">✦</span>
                <span className="absolute -bottom-1 -left-1 text-purple-300 text-[8px]">✦</span>
              </div>
            )
          },
          {
            key: 'Weekly',
            label: 'Weekly',
            icon: (
              <div className="relative flex items-center justify-center">
                <span className="text-xl sm:text-2xl">📅</span>
              </div>
            )
          },
          {
            key: 'Monthly',
            label: 'Monthly',
            icon: (
              <div className="relative flex items-center justify-center">
                <span className="text-xl sm:text-2xl">🌙</span>
              </div>
            )
          },
          {
            key: 'All',
            label: 'All Chores',
            icon: (
              <div className="relative flex items-center justify-center">
                <span className="text-xl sm:text-2xl">📋</span>
              </div>
            )
          },
        ].map((tab) => {
          const isActive = filterFrequency === tab.key;

          return (
            <button
              key={tab.key}
              id={`tab-freq-${tab.key.toLowerCase()}`}
              onClick={() => setFilterFrequency(tab.key as TaskFrequency | 'All')}
              className={`py-3 sm:py-5 px-1.5 sm:px-3 rounded-[20px] sm:rounded-[24px] text-xs font-bold tracking-wide text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 active:scale-95 ${isActive
                  ? 'bg-gradient-to-b from-[#FAF8FF] to-[#E5DCFC] border-2 border-[#B3A0F2] text-[#4E3494] shadow-[0_4px_12px_rgba(157,130,242,0.18)] font-black'
                  : 'bg-white border border-[#EBE5F7] text-[#7E7399] hover:bg-[#FAF8FF] hover:border-[#D5C7F7] shadow-xs font-medium'
                }`}
            >
              {tab.icon}
              <span className="font-sans text-[11px] sm:text-xs tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* One-Time full width banner button */}
      <button
        id="tab-freq-one-time"
        onClick={() => setFilterFrequency('One-time')}
        className={`w-full py-3 px-4 sm:px-6 rounded-full text-center transition-all cursor-pointer flex items-center justify-between active:scale-98 ${filterFrequency === 'One-time'
            ? 'bg-gradient-to-r from-[#FAF8FF] via-[#E5DCFC] to-[#FAF8FF] border-2 border-[#B3A0F2] text-[#4E3494] shadow-[0_4px_12px_rgba(157,130,242,0.15)]'
            : 'bg-white/80 border border-[#E9E4F5] text-[#7E7399] hover:bg-[#FAF8FF] hover:border-[#D5C7F7] shadow-xs'
          }`}
      >
        <div className="flex items-center gap-1.5 font-caveat font-bold text-lg sm:text-xl text-[#7E7399]">
          <span className="text-[#9D82F2] text-sm">★</span>
          <span className="italic text-[#5C42A5] font-black tracking-wide">One-Time</span>
        </div>

        {/* Dashed connector line */}
        <div className="flex-1 border-b border-dashed border-[#E1D8F5] mx-4 opacity-70"></div>

        <div className="flex items-center gap-1">
          <span className="text-purple-300 text-xs select-none">🌿</span>
        </div>
      </button>

      {/* Filter and Completion Rates bar aligned with the notebook page layout */}
      <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-[#E9E4F5] shadow-xs flex items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Left: Dynamic Blooming plant */}
        <div className="w-16 h-20 sm:w-20 sm:h-[100px] flex items-center justify-center shrink-0 translate-y-0.5 sm:translate-y-1">
          <LavenderBloom progress={completionPercent} className="w-full h-full" />
        </div>

        {/* Center Column: Title + Subtitle + Done text + Progress bar */}
        <div className="flex-1 flex flex-col items-center text-center gap-1.5 min-w-0 px-2 sm:px-4">
          {/* Title */}
          <h4 className="font-serif text-sm sm:text-base font-bold text-[#5C42A5] tracking-wide leading-none">
            Blooming Progress
          </h4>

          {/* Subheading Line 1 */}
          {completionPercent === 100 ? (
            <p className="font-serif italic text-[10px] sm:text-[11px] font-bold text-[#5C42A5] leading-tight flex items-center justify-center gap-1">
              Your day has fully bloomed!
              <svg viewBox="0 0 24 24" fill="none" stroke="#7A63D4" strokeWidth="2.2" className="w-3.5 h-3.5 shrink-0">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </p>
          ) : (
            <p className="font-serif italic text-[9px] sm:text-[10px] text-[#7A63D4] leading-tight">
              Your day blooms with every completed task. <span className="text-[#9D82F2] text-[10px]">💜</span>
            </p>
          )}

          {/* Subheading Line 2 (Only at 100%) */}
          {completionPercent === 100 && (
            <p className="font-serif text-[9px] sm:text-[10px] text-[#7A63D4] leading-tight flex items-center justify-center gap-1.5">
              <span>Well done! You earned <strong className="text-[#5C42A5] font-extrabold">+50 XP</strong></span>
              <span className="w-4 h-4 bg-gradient-to-br from-[#FFFCEF] to-[#FFF1B8] rounded-full flex items-center justify-center border border-[#FFE78A] shadow-2xs shrink-0">
                <svg viewBox="0 0 24 24" fill="#E28A07" className="w-2.5 h-2.5">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </span>
            </p>
          )}

          {/* Done status */}
          <div className="text-[9px] sm:text-[10px] font-semibold text-[#8A75DE] tracking-wide font-sans">
            {completedCount}/{totalCount} done
          </div>

          {/* Progress Bar (stretched full width of center column) */}
          <div className="w-full h-2 bg-[#F3EEFA] rounded-full overflow-hidden border border-[#E9E4F5] relative shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionPercent}%`,
                backgroundImage: 'repeating-linear-gradient(45deg, #9D82F2, #9D82F2 10px, #BFAEF8 10px, #BFAEF8 20px)'
              }}
            />
          </div>
        </div>

        {/* Right: Sparkles (aligned on the right of the card) */}
        <div className="shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 select-none pointer-events-none opacity-85">
            <path d="M 20 5 C 20 15, 15 20, 5 20 C 15 20, 20 25, 20 35 C 20 25, 25 20, 35 20 C 25 20, 20 15, 20 5 Z" fill="#9D82F2" />
            <path d="M 38 25 C 38 30, 35 32, 30 32 C 35 32, 38 34, 38 39 C 38 34, 41 32, 46 32 C 41 32, 38 30, 38 25 Z" fill="#BFAEF8" />
          </svg>
        </div>
      </div>

      {/* Clean notebook container with transparent background */}
      <div className="relative py-4 pointer-events-none z-10">

        {/* The beautiful white physical notebook page */}
        <div className="relative bg-white border border-[#E9E4F5] rounded-r-[24px] rounded-l-[10px] sm:rounded-r-[32px] sm:rounded-l-[14px] shadow-lg py-5 pr-3 pl-8 sm:py-8 sm:pr-8 sm:pl-10 min-h-[480px] flex flex-col justify-between pointer-events-auto">

          {/* Premium Ring Binder Loops — Spaced uniformly using a fixed CSS gap to prevent stretching/squishing on filter changes */}
          <div className="absolute left-[-16px] sm:left-[-16px] top-0 bottom-0 flex flex-col gap-6 py-8 overflow-hidden pointer-events-none z-20">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="relative flex items-center justify-center w-[32px] h-[28px]">
                <svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                  <defs>
                    {/* Polished chrome front metal gradient */}
                    <linearGradient id={`metal-front-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="25%" stopColor="#f1f5f9" />
                      <stop offset="45%" stopColor="#ffffff" />
                      <stop offset="70%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                  </defs>

                  {/* A. Reinforced purple eyelet matching the reference image */}
                  <circle cx="24" cy="14" r="5.5" fill="#b19ffb" stroke="#7c3aed" strokeWidth="1" />
                  <circle cx="24" cy="14" r="3.5" fill="#18142c" />

                  {/* B. Soft shadow inside the hole */}
                  <circle cx="24" cy="14" r="2.5" fill="#0f172a" opacity="0.3" filter="blur(1px)" />

                  {/* C. Single continuous oval wire loop (starts at x=17 behind page, loops left to x=8, enters hole at 24,14) */}
                  <path
                    d="M 17 21 A 16 8 0 0 1 8 14 A 16 8 0 0 1 24 14"
                    fill="none"
                    stroke={`url(#metal-front-${i})`}
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  {/* Subtle inner wire shine for 3D roundness */}
                  <path
                    d="M 17 21 A 16 8 0 0 1 8 14 A 16 8 0 0 1 24 14"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ))}
          </div>
          {/* Notebook Paper Inner Area */}
          <div className="flex-1 flex flex-col justify-between">

            <div>
              {/* Notebook Header */}
              <div className="relative z-10 mb-6 pb-4 border-b border-[#F0EBFC] flex flex-col items-center text-center">

                {/* Title row — title centered, list button right (absolute) */}
                <div className="relative w-full flex items-center justify-center py-1">

                  {/* Title + sparkle — always centered regardless of side elements */}
                  <div className="relative flex items-center gap-1">

                    {/* Lavender sprig — positioned absolutely to the left of the centered title */}
                    <div className="absolute right-[calc(100%+4px)] top-1/2 -translate-y-1/2 select-none pointer-events-none shrink-0">
                      <LavenderSprig className="w-[42px] h-[56px] sm:w-[54px] sm:h-[72px]" />
                    </div>

                    <h3 className="font-caveat text-4xl sm:text-[50px] font-bold text-[#533FA2] tracking-wide whitespace-nowrap leading-none">
                      {filterFrequency === 'Weekly' 
                        ? 'Weekly Chores' 
                        : filterFrequency === 'Daily' 
                        ? 'Daily Chores' 
                        : filterFrequency === 'Monthly' 
                        ? 'Monthly Chores' 
                        : filterFrequency === 'One-time' 
                        ? 'One-Time Chores' 
                        : 'All Chores'}
                    </h3>
                    <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 select-none pointer-events-none">
                      <path d="M 20 5 C 20 15, 15 20, 5 20 C 15 20, 20 25, 20 35 C 20 25, 25 20, 35 20 C 25 20, 20 15, 20 5 Z" fill="#B39DFA" />
                      <path d="M 38 25 C 38 30, 35 32, 30 32 C 35 32, 38 34, 38 39 C 38 34, 41 32, 46 32 C 41 32, 38 30, 38 25 Z" fill="#C5B5FC" />
                      <path d="M 28 38 C 28 41, 26 42, 23 42 C 26 42, 28 43, 28 46 C 28 43, 30 42, 33 42 C 30 42, 28 41, 28 38 Z" fill="#DCD4FF" />
                    </svg>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="font-sans text-xs sm:text-sm font-medium text-[#7E7399] tracking-wider mt-2.5">
                  Small steps, a better you.
                </p>

                {/* Status Filter Bar */}
                <div className="w-full bg-[#FAF8FF] border border-[#EBE5F7] rounded-full p-1 grid grid-cols-3 gap-1 mt-5 pointer-events-auto">
                  {[
                    { key: 'Pending', label: 'In Progress', icon: <Circle className="w-3.5 h-3.5" strokeDasharray="3 3" /> },
                    { key: 'Completed', label: 'Completed', icon: <CheckCircle className="w-3.5 h-3.5" /> },
                    { key: 'All', label: 'All', icon: <LayoutGrid className="w-3.5 h-3.5" fill="currentColor" /> },
                  ].map((tab) => {
                    const isActive = statusFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setStatusFilter(tab.key as 'All' | 'Completed' | 'Pending')}
                        className={`w-full py-2 px-1.5 sm:px-3 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap text-[#5C42A5] ${
                          isActive
                            ? 'bg-[#E5DCFC] shadow-xs'
                            : 'hover:bg-[#F3EEFA]/50'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>


              {/* Task Items List */}
              {filteredTasks.length === 0 ? (
                <div className="relative z-10 py-16 text-center select-none">
                  <Sparkles className="w-12 h-12 text-[#BFAEF8] mx-auto mb-3 animate-pulse" />
                  <h4 className="font-caveat text-3xl font-extrabold text-[#3B2961]">Your Chore Book is Clean!</h4>
                  <p className="text-xs text-[#7E7399] font-sans mt-1 max-w-sm mx-auto leading-relaxed">
                    No tasks found. Use the "+" button below or create a chore to decorate your lovely planner page.
                  </p>
                </div>
              ) : (
                <div className="relative z-10 space-y-3 pb-6 mt-6">
                  {orderedTasks.map((task) => {
                    const assignees = getAssigneeProfiles(task.assignedTo);
                    const isCompleted = task.status === 'Completed';

                    return (
                      <div
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, task.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, task.id)}
                        className={`bg-white rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-5 border transition-all relative flex gap-2.5 sm:gap-4 group overflow-hidden select-none cursor-grab active:cursor-grabbing ${
                          fadingOutIds.includes(task.id)
                            ? 'opacity-0 scale-95 -translate-y-2 pointer-events-none duration-600 ease-in-out'
                            : draggedTaskId === task.id 
                            ? 'opacity-40 border-dashed border-[#BFAEF8] scale-[0.98]' 
                            : dragOverTaskId === task.id
                            ? 'border-[#9D82F2] ring-2 ring-[#9D82F2]/30 scale-[1.01]'
                            : 'border-[#F0EBF9] hover:shadow-md shadow-xs'
                        }`}
                      >
                        {/* Left column: Checkbox */}
                        <div className={`flex flex-col items-center shrink-0 pt-0.5 ${draggedTaskId ? 'pointer-events-none' : ''}`} draggable={false}>
                          {isCompleted ? (
                            <button
                              onClick={() => handleToggleCompleteWithAnimation(task)}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-[6px] sm:rounded-[8px] bg-[#9D82F2] border border-[#9D82F2] flex items-center justify-center text-white cursor-pointer hover:bg-purple-600 transition-colors shrink-0"
                            >
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleCompleteWithAnimation(task)}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-[6px] sm:rounded-[8px] border-2 border-[#E0D9F0] hover:border-purple-400 bg-white transition-all cursor-pointer shrink-0"
                            />
                          )}
                        </div>

                        {/* Right column: All text details and actions */}
                        <div className={`flex-1 min-w-0 flex flex-col gap-1 sm:gap-1.5 ${draggedTaskId ? 'pointer-events-none' : ''}`}>
                          {/* Title block with category icon */}
                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <span className="text-sm sm:text-lg select-none shrink-0 mt-0.5">
                              {task.category === 'Chore' && '🧹'}
                              {task.category === 'Routine' && '🌱'}
                              {task.category === 'Exercise' && '🏃‍♂️'}
                              {task.category === 'Goal' && '🎯'}
                            </span>
                            <h4 
                              className="font-sans font-bold text-xs sm:text-base text-[#3B2961] tracking-wide leading-snug transition-all"
                              style={{
                                background: 'linear-gradient(to right, currentColor, currentColor) no-repeat left 50%',
                                backgroundSize: isCompleted ? '100% 2px' : '0% 2px',
                                color: isCompleted ? '#94a3b8' : '#3B2961',
                                opacity: isCompleted ? 0.7 : 1,
                                transition: 'background-size 1.2s ease-out, color 1.2s ease-out, opacity 1.2s ease-out'
                              }}
                            >
                              {task.title}
                            </h4>
                          </div>

                          {/* Description */}
                          {task.description && (
                            <p 
                              className="text-[11px] sm:text-[13px] text-[#7E7399] font-medium leading-relaxed pl-1 transition-all"
                              style={{
                                background: 'linear-gradient(to right, currentColor, currentColor) no-repeat left 50%',
                                backgroundSize: isCompleted ? '100% 1px' : '0% 1px',
                                color: isCompleted ? '#94a3b8' : '#7E7399',
                                opacity: isCompleted ? 0.6 : 1,
                                transition: 'background-size 1.2s ease-out, color 1.2s ease-out, opacity 1.2s ease-out'
                              }}
                            >
                              {task.description}
                            </p>
                          )}

                          {/* Clock, XP reward and Completion bubble row */}
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 pt-0.5 pl-1">
                            {task.timeOfDay && (
                              <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[#7E7399] font-medium">
                                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#A699C7]" />
                                <span>{task.timeOfDay}</span>
                              </span>
                            )}

                            {task.timeOfDay && <span className="text-[#E1D8F5] text-[10px] sm:text-xs">|</span>}

                            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[#C19519] font-bold">
                              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#F6C644] text-[#C19519]" />
                              <span>+{task.xpReward} XP</span>
                            </span>

                            {task.isRecurring && (
                              <>
                                <span className="text-[#E1D8F5] text-[10px] sm:text-xs">|</span>
                                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[#7A63D4] font-bold bg-[#F3EEFA] px-1.5 py-0.5 rounded-md select-none shrink-0" draggable={false}>
                                  <span>🔄</span>
                                  <span>
                                    {task.recurrenceInterval === 1 ? 'Every' : `Every ${task.recurrenceInterval}`} {
                                      task.frequency === 'Daily' ? (task.recurrenceInterval === 1 ? 'day' : 'days') :
                                      task.frequency === 'Weekly' ? (task.recurrenceInterval === 1 ? 'week' : 'weeks') :
                                      task.frequency === 'Monthly' ? (task.recurrenceInterval === 1 ? 'month' : 'months') :
                                      (task.recurrenceInterval === 1 ? 'day' : 'days')
                                    }
                                    {task.recurrenceDurationType === 'occurrences' && ` (${task.recurrenceDurationValue}x)`}
                                    {task.recurrenceDurationType === 'date' && ` (until ${task.recurrenceEndDate})`}
                                  </span>
                                </span>
                              </>
                            )}
                          </div>

                          {/* Bottom footer row containing assignee details & edit actions */}
                          <div className="flex items-center justify-between gap-2 border-t border-[#F5F0FC] pt-2 mt-1.5 pl-1">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] sm:text-xs text-[#A699C7] font-medium">Assigned:</span>
                              <div className="flex -space-x-1.5 overflow-hidden">
                                {assignees.map((member) => (
                                  <div
                                    key={member.uid}
                                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#F0EBFC] border-2 border-white flex items-center justify-center text-[10px] sm:text-xs shadow-xs overflow-hidden"
                                    title={member.displayName}
                                  >
                                    {member.avatarUrl ? (
                                      <img src={member.avatarUrl} alt={member.displayName} className="w-full h-full object-cover select-none" />
                                    ) : (
                                      <span className="select-none">{member.avatarEmoji}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5 text-[#A699C7]" draggable={false}>
                              {onEditTaskClick && (
                                <button
                                  onClick={() => onEditTaskClick(task)}
                                  className="p-1 sm:p-1.5 hover:bg-[#F3EEFA] hover:text-[#7A63D4] rounded-lg transition-all cursor-pointer"
                                  title="Edit Chore"
                                >
                                  <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                              )}
                              <span className="h-3 w-[1px] bg-[#E1D8F5] mx-0.5" />
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                className="p-1 sm:p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                                title="Delete Chore"
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>


            {/* Notebook Bottom Footer block mimicking the sticker layout in the screenshot */}
            <div className="relative z-10 border-t border-dashed border-[#E1D8F5] pt-6 mt-10 space-y-5">

              <div className="bg-[#FAF8FF] border border-[#E9E4F5] rounded-[24px] p-4 flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F3EEFA] flex items-center justify-center text-[#9D82F2] shadow-xs">
                    <Heart className="w-5 h-5 fill-[#9D82F2] text-[#9D82F2]" />
                  </div>
                  <div>
                    <h4 className="font-caveat text-xl sm:text-2xl font-bold text-[#4B307E] leading-none">
                      Progress, not perfection.
                    </h4>
                    <p className="text-xs text-[#7E7399] mt-1 font-sans font-medium">
                      You've got this! ✦
                    </p>
                  </div>
                </div>

                {/* Circular action button '+' to create task inside the notebook sheet */}
                {onCreateTaskClick && (
                  <button
                    onClick={() => {
                      onCreateTaskClick();
                      try {
                        soundEffects.playChime();
                      } catch (e) { }
                    }}
                    className="w-12 h-12 rounded-[16px] bg-[#9D82F2] hover:bg-purple-600 text-white shadow-sm shadow-[#9D82F2]/25 flex items-center justify-center transition-all duration-200 transform active:scale-95 cursor-pointer shrink-0"
                    title="Create New Task"
                  >
                    <Plus className="w-6 h-6 stroke-[3]" />
                  </button>
                )}
              </div>

              {/* Mood selector card embedded at the absolute bottom margin */}
              <div className="flex flex-col items-center gap-2 bg-[#FAF8FF]/60 border border-[#FAF8FF] hover:bg-[#FAF8FF]/90 transition-colors rounded-2xl p-3 shadow-xs">
                <span className="font-sans text-xs font-bold text-[#7E7399] tracking-wide select-none">
                  My Mood Today:
                </span>
                <div className="flex items-center justify-center gap-3">
                  {[
                    { emoji: '😊', label: 'Happy' },
                    { emoji: '💪', label: 'Productive' },
                    { emoji: '🥳', label: 'Excited' },
                    { emoji: '😌', label: 'Relaxed' },
                    { emoji: '😴', label: 'Tired' },
                    { emoji: '🧠', label: 'Focused' }
                  ].map((m) => {
                    const isSelected = selectedMood === m.emoji;
                    return (
                      <button
                        key={m.emoji}
                        onClick={() => handleMoodSelect(m.emoji)}
                        className={`text-2xl transition-all duration-150 hover:scale-125 hover:-rotate-6 filter cursor-pointer ${isSelected
                            ? 'scale-125 drop-shadow-md rotate-[-6deg] opacity-100 ring-2 ring-[#BFAEF8] ring-offset-2 rounded-full p-0.5 bg-white'
                            : selectedMood
                              ? 'opacity-45 grayscale-[25%] hover:opacity-100 hover:grayscale-0'
                              : 'opacity-85 hover:opacity-100'
                          }`}
                        title={m.label}
                      >
                        {m.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
