import React, { useEffect, useState } from 'react';
import Loader from './Cargando';
import { useParams, useNavigate } from 'react-router-dom';

function ListaChats() {
  const { id } = useParams(); // Ej: "3-7" o solo "3"
  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://pruebasitflex.onrender.com';

  const navigate = useNavigate();

  // Separar los IDs
  const [usuarioId, interlocutorId] = id ? id.split('-') : [null, null];

  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [chatAbierto, setChatAbierto] = useState(interlocutorId || null);
  const [mensajes, setMensajes] = useState([]);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);

  // Cargar la lista de chats usando solo usuarioId
  useEffect(() => {
    if (!usuarioId) return;

    setLoading(true);
    fetch(`${API_URL}/api/chats/${usuarioId}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar chats');
        return res.json();
      })
      .then(data => setChats(data))
      .catch(err => {
        console.error('Error cargando chats:', err);
        setChats([]);
      })
      .finally(() => setLoading(false));
  }, [usuarioId, API_URL]);

  // Cargar mensajes si hay chat abierto (interlocutorId)
  useEffect(() => {
    if (!chatAbierto || !usuarioId) return;

    setCargandoMensajes(true);
    fetch(`${API_URL}/api/chats/${usuarioId}/mensajes/${chatAbierto}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar mensajes');
        return res.json();
      })
      .then(data => setMensajes(data))
      .catch(err => {
        console.error('Error cargando mensajes:', err);
        setMensajes([]);
      })
      .finally(() => setCargandoMensajes(false));
  }, [chatAbierto, usuarioId, API_URL]);

  // Abrir chat y actualizar URL
  const abrirChat = (nuevoInterlocutorId) => {
    setChatAbierto(nuevoInterlocutorId);
    navigate(`/Chats/${usuarioId}-${nuevoInterlocutorId}`, { replace: true });
  };
 const interlocutorNombre = chats.find(chat => chat.interlocutor_id === chatAbierto)?.interlocutor_nombre || chatAbierto;
  if (loading) return <Loader />;

  return (
  <div style={{ display: 'flex', gap: '20px' }}>
    {/* Lista de chats */}
    <div style={{ flex: 1, maxWidth: '300px' }}>
      <h2>Chats del usuario</h2>
      {chats.length === 0 ? (
        <p>No tienes chats aún.</p>
      ) : (
        <ul>
          {chats.map(chat => (
            <li
              key={chat.chat_id}
              style={{
                cursor: 'pointer',
                fontWeight: chatAbierto === chat.interlocutor_id ? 'bold' : 'normal',
                padding: '8px',
                borderBottom: '1px solid #ddd'
              }}
              onClick={() => abrirChat(chat.interlocutor_id)}
            >
              {chat.interlocutor_nombre} (ID: {chat.interlocutor_id})
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* Chat abierto */}
    <div style={{ flex: 2, borderLeft: '1px solid #ccc', paddingLeft: '15px' }}>
      {chatAbierto ? (
        <>
          <h3>Chat con {interlocutorNombre}</h3>
          {cargandoMensajes ? (
            <Loader />
          ) : mensajes.length === 0 ? (
            <p>No hay mensajes en este chat.</p>
          ) : (
            <ul>
              {mensajes.map((msg) => (
                <li key={msg.id}>
                  <strong>{msg.emisor_nombre}:</strong> {msg.texto}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p>Selecciona un chat para ver la conversación</p>
      )}
    </div>
  </div>
);
}

export default ListaChats;
