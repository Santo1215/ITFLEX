export const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://itflex.onrender.com';

  export const getUserId = () => {
  return localStorage.getItem('userId');
};