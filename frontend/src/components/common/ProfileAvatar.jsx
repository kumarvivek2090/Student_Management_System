import React from 'react';

const ProfileAvatar = ({
  user,
  size = 'md',
  showStatus = true,
  className = '',
  borderClass = 'border-2 border-[#52613B] dark:border-[#68784B]'
}) => {
  // Extract clean initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name
      .trim()
      .split(/\s+/)
      .filter((p) => !p.toLowerCase().startsWith('dr.') && !p.toLowerCase().startsWith('prof.'));
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(user?.fullName);

  // Strictly equal width and height with min-dimensions to prevent flex squishing in Safari/Edge/Firefox
  const sizeClasses = {
    xs: 'w-6 h-6 min-w-[24px] min-h-[24px] text-[10px]',
    sm: 'w-9 h-9 min-w-[36px] min-h-[36px] text-xs',
    md: 'w-10 h-10 min-w-[40px] min-h-[40px] text-sm',
    lg: 'w-12 h-12 min-w-[48px] min-h-[48px] text-base',
    xl: 'w-14 h-14 min-w-[56px] min-h-[56px] text-lg font-bold'
  };

  // Status dot positioning: STRICTLY INSIDE circular perimeter
  // Insetting prevents any boundary clipping or edge overflow
  const dotClasses = {
    xs: 'w-1.5 h-1.5 bottom-0.5 right-0.5 border border-[#151B13]',
    sm: 'w-2.5 h-2.5 bottom-0.5 right-0.5 border-[1.5px] border-[#151B13]',
    md: 'w-2.5 h-2.5 bottom-1 right-1 border-2 border-[#151B13]',
    lg: 'w-3 h-3 bottom-1 right-1 border-2 border-[#151B13]',
    xl: 'w-3.5 h-3.5 bottom-1.5 right-1.5 border-2 border-[#151B13]'
  };

  // Role-based gradient accents
  const getRoleGradient = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'from-[#243629] via-[#344A38] to-[#1D251A] text-white';
      case 'TEACHER':
        return 'from-[#344A38] via-[#52613B] to-[#2F3C21] text-white';
      case 'STUDENT':
        return 'from-[#2F5233] via-[#3E6B48] to-[#243629] text-white';
      case 'PARENT':
        return 'from-[#6E5429] via-[#856D38] to-[#4E3917] text-white';
      default:
        return 'from-[#52613B] to-[#293526] text-white';
    }
  };

  const isSuspended = user?.status === 'SUSPENDED' || user?.status === 'INACTIVE';
  const resolvedSize = sizeClasses[size] || sizeClasses.md;
  const resolvedDot = dotClasses[size] || dotClasses.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none p-0.5 aspect-square rounded-full ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user?.fullName || 'User Profile'}
          className={`${resolvedSize} rounded-full aspect-square object-cover ${borderClass} shadow-sm shrink-0 block`}
        />
      ) : (
        <div
          className={`${resolvedSize} rounded-full aspect-square bg-gradient-to-br ${getRoleGradient(
            user?.role
          )} flex items-center justify-center font-bold tracking-wider ${borderClass} shadow-sm shrink-0`}
          title={user?.fullName || 'User'}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute rounded-full z-10 pointer-events-none ${resolvedDot} ${
            isSuspended ? 'bg-[#DC4545]' : 'bg-[#198754]'
          }`}
          title={`Status: ${isSuspended ? 'Inactive' : 'Active'}`}
        >
          {!isSuspended && (
            <span className="absolute inset-0 rounded-full bg-[#198754] animate-ping opacity-75" />
          )}
        </span>
      )}
    </div>
  );
};

export default ProfileAvatar;
