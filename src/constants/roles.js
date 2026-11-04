export const ROLES = Object.freeze({
  GUEST: 'GUEST',
  STUDENT: 'STUDENT',
  MANAGER: 'MANAGER',
});

export const ROLE_HOME = Object.freeze({
  [ROLES.STUDENT]: '/student',
  [ROLES.MANAGER]: '/manager',
});

// Permission helper functions
export const canAccessRoute = (userRole, routeGroup) => {
  if (!userRole && routeGroup === 'guest') return true;
  if (!userRole) return false;
  
  const role = userRole.toUpperCase();
  
  // Guest routes are accessible to everyone
  if (routeGroup === 'guest') return true;
  
  // Student routes only for students
  if (routeGroup === 'student') return role === ROLES.STUDENT;
  
  // Manager routes only for managers
  if (routeGroup === 'manager') return role === ROLES.MANAGER;
  
  return false;
};

export const isAuthenticated = (userRole) => {
  return userRole && (userRole === ROLES.STUDENT || userRole === ROLES.MANAGER);
};

export const isGuest = (userRole) => {
  return !userRole || userRole === ROLES.GUEST;
};
