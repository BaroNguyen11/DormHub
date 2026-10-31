export const ROLES = Object.freeze({
  STUDENT: 'STUDENT',
  MANAGER: 'MANAGER',
});

export const ROLE_HOME = Object.freeze({
  [ROLES.STUDENT]: '/student',
  [ROLES.MANAGER]: '/manager',
});
