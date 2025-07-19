export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message) || 
         error.message === 'Unauthorized' ||
         error.message === 'No token found';
}

export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
