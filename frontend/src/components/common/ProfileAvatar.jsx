import React from 'react';

const ProfileAvatar = ({
  user,
  size = 'md',
  showStatus = true,
  className = '',
  ring = true
}) => {
  // Extract clean initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/).filter(p => !p.toLowerCase().startsWith('dr.') && !p.toLowerCase().startsWith('prof.'));
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(user?.fullName);

  // Size mappings
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg font-bold'
  };

  // Status dot size mappings
  const dotSizeClasses = {
    xs: 'w-1.5 h-1.5 -bottom-0.5 -right-0.5 border',
    sm: 'w-2.5 h-2.5 bottom-0 right-0 border-2',
    md: 'w-3 h-3 bottom-0 right-0 border-2',
    lg: 'w-3.5 h-3.5 bottom-0.5 right-0.5 border-2',
    xl: 'w-4 h-4 bottom-0.5 right-0.5 border-2'
  };

  // Role-based gradient accents
  const getRoleGradient = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'from-[#243629] via-[#344A38] to-[#1D251A] text-white border-[#52613B] shadow-inner';
      case 'TEACHER':
        return 'from-[#344A38] via-[#52613B] to-[#2F3C21] text-white border-[#7B8F5E] shadow-inner';
      case 'STUDENT':
        return 'from-[#2F5233] via-[#3E6B48] to-[#243629] text-white border-[#84A98C] shadow-inner';
      case 'PARENT':
        return 'from-[#6E5429] via-[#856D38] to-[#4E3917] text-white border-[#D2B66F] shadow-inner';
      default:
        return 'from-[#52613B] to-[#293526] text-white border-[#CAD6B7] shadow-inner';
    }
  };

  const isSuspended = user?.status === 'SUSPENDED' || user?.status === 'INACTIVE';

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user?.fullName || 'User Profile'}
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover border ${
            ring ? 'ring-2 ring-white/90 shadow-sm' : ''
          }`}
        />
      ) : (
        <div
          className={`${sizeClasses[size] || sizeClasses.md} rounded-full bg-gradient-to-br ${getRoleGradient(
            user?.role
          )} flex items-center justify-center font-bold tracking-wider border ${
            ring ? 'ring-2 ring-white/90 shadow-sm' : ''
          }`}
          title={user?.fullName || 'User'}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute rounded-full border-white ${dotSizeClasses[size] || dotSizeClasses.md} ${
            isSuspended ? 'bg-[#DC4545]' : 'bg-[#198754]'
          }`}
          title={`Account Status: ${isSuspended ? 'Inactive' : 'Active'}`}
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
