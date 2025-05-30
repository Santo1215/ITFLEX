export const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://pruebasitflex.onrender.com';

  export const getUserId = () => {
  return localStorage.getItem('userId');
};