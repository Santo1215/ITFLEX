import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL, getUserId } from '../constants'; // importa getUserId

const BalanceContext = createContext();


export const BalanceProvider = ({ children }) => {
  const [balanceUsuario, setBalanceUsuario] = useState(0);
  

  useEffect(() => {
    const userId = getUserId(); // obtiene el ID del localStorage

    if (!userId) {
      console.warn('No se encontró userId en localStorage');
      return;
    }

    fetch(`${API_URL}/api/balance/usuario/${userId}`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setBalanceUsuario(data.balance);
      })
      .catch(err => {
        console.error('Error al obtener el balance:', err);
      });
  }, []);

const refetchBalance = () => {
  const userId = getUserId();
  if (!userId) return Promise.resolve();

  return fetch(`${API_URL}/api/balance/usuario/${userId}`, {
    credentials: 'include',
  })
    .then(res => res.json())
    .then(data => {
      if (data && typeof data.balance === 'number') {
        setBalanceUsuario(data.balance);
      }
    })
    .catch(console.error);
};


  return (
    <BalanceContext.Provider value={{ balanceUsuario, setBalanceUsuario, refetchBalance  }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};

