const hostname = window.location.hostname;

export const API_URL =
  hostname === 'localhost'
    ? 'http://localhost:5000'
    : hostname === 'itflex.onrender.com'
    ? 'https://itflex.onrender.com'
    : hostname === 'pruebasitflex.onrender.com'
    ? 'https://pruebasitflex.onrender.com'
    : 'https://itflex.onrender.com'; // valor por defecto

  export const getUserId = () => {
  return localStorage.getItem('userId');
};