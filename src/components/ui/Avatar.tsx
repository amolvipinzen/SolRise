import { UserProfile } from '../../types';

interface AvatarProps {
  user: Pick<UserProfile, 'avatarUrl' | 'avatarEmoji' | 'displayName'>;
  size?: number;
  ring?: boolean;
  className?: string;
}

export default function Avatar({ user, size = 40, ring = false, className = '' }: AvatarProps) {
  return (
    <div
      className={`rounded-full bg-subtle flex items-center justify-center overflow-hidden shrink-0 select-none ${
        ring ? 'ring-2 ring-surface' : ''
      } ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.55 }}
      title={user.displayName}
    >
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
      ) : (
        <span className="leading-none">{user.avatarEmoji || '🙂'}</span>
      )}
    </div>
  );
}
