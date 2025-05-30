import React, { useEffect, useState, useRef } from 'react';
import Loader from './Cargando';
import { useParams, useNavigate } from 'react-router-dom';
import {ChatFooter} from "./BtnEnviar";
import { API_URL } from '../constants';

function ListaChats() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Separar los IDs
  const [usuarioId, interlocutorId] = id ? id.split('-') : [null, null];
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [chatAbierto, setChatAbierto] = useState(interlocutorId || null);
  const [mensajes, setMensajes] = useState([]);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [entrada, setEntrada] = useState('');

  const contenedorMensajesRef = useRef(null);

  useEffect(() => {
  if (!usuarioId) return;

  setLoading(true);
  fetch(`${API_URL}/api/chats/${usuarioId}`, { credentials: "include" })
    .then(res => {
      if (!res.ok) throw new Error('Error al cargar chats');
      return res.json();
    })
    .then(data => {
      console.log('Chats recibidos del backend:', data);
      setChats(data);
    })
    .catch(err => {
      console.error('Error cargando chats:', err);
      setChats([]);
    })
    .finally(() => setLoading(false));
}, [usuarioId, API_URL]);

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
  if (!chatAbierto || !usuarioId) {
    setMensajes([]);
    return;
  }
    setCargandoMensajes(true);
      fetch(`${API_URL}/api/chats/${usuarioId}/marcar-vistos/${chatAbierto}`, {
        method: 'POST',
        credentials: 'include',
      })
      .then(() => fetch(`${API_URL}/api/chats/${usuarioId}`, { credentials: 'include' }))
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar chats');
        return res.json();
      })
      .then(data => setChats(data))
      .catch(err => console.error('Error actualizando chats tras marcar vistos:', err));

    }, [chatAbierto, usuarioId, API_URL]);

  useEffect(() => {
  if (chatAbierto && usuarioId) {
    fetch(`${API_URL}/api/chats/${usuarioId}/marcar-vistos/${chatAbierto}`, {
      method: 'POST',
      credentials: 'include',
    })
    .then(() => {
      // Luego de marcar vistos, recarga chats para actualizar contador
      return fetch(`${API_URL}/api/chats/${usuarioId}`, { credentials: 'include' });
    })
    .then(res => {
      if (!res.ok) throw new Error('Error al cargar chats');
      return res.json();
    })
    .then(data => setChats(data))
    .catch(err => {
      console.error('Error actualizando chats después de marcar vistos:', err);
    });
  }
}, [chatAbierto, usuarioId]);
  
  // Scroll automático al final de mensajes al cambiar mensajes
  useEffect(() => {
    if (contenedorMensajesRef.current) {
      contenedorMensajesRef.current.scrollTop = contenedorMensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Abrir chat y actualizar URL
  const abrirChat = (chat) => {
    setChatAbierto(chat.chat_id);
    navigate(`/chats/${usuarioId}`);
  };

  // Función para enviar un mensaje
const enviarMensaje = async () => {
  try {
    const response = await fetch(`${API_URL}/api/chats/${usuarioId}/mensajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        chat_id: chatAbierto,
        texto: entrada,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error del servidor:', errorData);
      throw new Error(errorData.error || 'Error al enviar mensaje');
    }

    const data = await response.json();
    setMensajes(prev => [...prev, data]);
    setEntrada('');

    // Refrescar lista de chats para actualizar último mensaje y contadores
    const resChats = await fetch(`${API_URL}/api/chats/${usuarioId}`, { credentials: 'include' });
    if (!resChats.ok) throw new Error('Error al recargar chats después de enviar mensaje');
    const chatsActualizados = await resChats.json();
    setChats(chatsActualizados);

    return data;
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    throw error;
  }
};


useEffect(() => {
  if (!chatAbierto || !usuarioId) {
    setMensajes([]);
    return;
  }

  setCargandoMensajes(true);
  fetch(`${API_URL}/api/chats/${usuarioId}/mensajes/${chatAbierto}`, { credentials: "include" })
    .then(res => {
      if (!res.ok) throw new Error('Error al cargar mensajes');
      return res.json();
    })
    .then(data => {
      console.log('Mensajes recibidos:', data);
      setMensajes(data);
    })
    .catch(err => {
      console.error('Error cargando mensajes:', err);
      setMensajes([]);
    })
    .finally(() => setCargandoMensajes(false));
}, [chatAbierto, usuarioId, API_URL]);

  // Manejar Enter para enviar, Shift+Enter para salto de línea
  const manejarTecla = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

const interlocutorNombre = chats.find(chat => chat.chat_id === chatAbierto)?.interlocutor_nombre || chatAbierto;
const chatActivo = chats.find(chat => chat.chat_id === chatAbierto);

  if (loading) return <Loader />;

  return (
    <div style={estilos.contenedorPrincipal}>
      {/* Panel lateral */}
      <aside style={estilos.panelChats}>
        <header style={estilos.encabezadoPanel}>
          <h2>Chats</h2>
        </header>
        {!chats.length && <p style={{ padding: '20px', color: '#888' }}>No tienes chats aún.</p>}
        <ul style={estilos.listaChats}>
          {chats.map(chat => {
            console.log('Chat:', chat);
            return (
            <li
              key={chat.chat_id}
              onClick={() => abrirChat(chat)}
              style={{
                ...estilos.itemChat,
                ...(chatAbierto === chat.interlocutor_id ? estilos.chatActivo : {}),
                position: 'relative',
              }}
            >
              <div style={estilos.avatar}>
                {chat.avatar_url ? (
                  <img 
                    src={chat.avatar_url} 
                    alt={`Avatar de ${chat.interlocutor_nombre}`} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <span>
                    {chat.interlocutor_nombre && chat.interlocutor_nombre.length > 0
                      ? chat.interlocutor_nombre[0].toUpperCase()
                      : 'U'}
                  </span>
                )}
              </div>
              <div style={estilos.infoChat}>
                <div style={estilos.nombreChat}>
                  {chat.interlocutor_nombre}
                  {chat.no_vistos > 0 && (
                    <span style={estilos.burbujaNotificacion}>{chat.no_vistos}</span>
                  )}
                </div>
              </div>
            </li>
          );})}
        </ul>
      </aside>

      {/* Panel de chat */}
      <section style={estilos.panelChat}>
        {chatAbierto && chatActivo ? (
          <>
            <header style={estilos.encabezadoChat}>
              <div style={estilos.avatarGrande}>
                {chatActivo.avatar_url ? (
                  <img 
                    src={chatActivo.avatar_url} 
                    alt={`Avatar de ${chatActivo.interlocutor_nombre}`} 
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <span>
                    {chatActivo.interlocutor_nombre && chatActivo.interlocutor_nombre.length > 0
                      ? chatActivo.interlocutor_nombre[0].toUpperCase()
                      : 'U'}
                  </span>
                )}
              </div>
              <h3 style={{ marginLeft: '15px' }}>{interlocutorNombre}</h3>
            </header>

            <main style={estilos.contenedorMensajes} ref={contenedorMensajesRef}>
              {mensajes.map(msg => {
                  const esUsuario = msg.sender_id === parseInt(usuarioId);
                  return (
                    <div
                      key={msg.mensaje_id}
                      style={{
                        ...estilos.mensaje,
                        ...(esUsuario ? estilos.mensajeUsuario : estilos.mensajeInterlocutor),
                      }}
                    >
                      <div style={estilos.textoMensaje}>{msg.text}</div>
                      <div style={esUsuario ? estilos.metainfoMensajeUsuario : estilos.metainfoMensajeInterlocutor}>
                        <small>
                          {esUsuario && (
                            <span style={{ marginLeft: 10, color: msg.seen ? '#3498DB' : 'gray' }}>
                              {msg.seen ? '✓✓ Visto' : '✓ Enviado'}
                            </span>
                          )}
                        </small>
                      </div>
                    </div>
                  );
                })}
            </main>

            <footer style={estilos.footerChat}>
              <ChatFooter 
                onSend={enviarMensaje} 
                value={entrada} 
                onChange={(e) => setEntrada(e.target.value)} 
                onKeyDown={manejarTecla}
              />
            </footer>
          </>
        ) : (
          <div style={estilos.sinChatSeleccionado}>
            <p>Selecciona un chat para ver la conversación</p>
          </div>
        )}
      </section>
    </div>
  );
}

const estilos = {
  contenedorPrincipal: {
    display: 'flex',
    height: '80vh',
    fontFamily: 'Arial, sans-serif',
  },
  panelChats: {
    width: '300px',
    borderRight: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
  },
  encabezadoPanel: {
    padding: '15px',
    borderBottom: '1px solid #ddd',
  },
  listaChats: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    overflowY: 'auto',
    flexGrow: 1,
  },
  itemChat: {
    cursor: 'pointer',
    padding: '10px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
  },
  chatActivo: {
    backgroundColor: '#e6f7ff',
  },
  avatar: {
    marginRight: '10px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#ccc',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: '20px',
    color: 'white',
  },
  infoChat: {
    flexGrow: 1,
  },
  nombreChat: {
    fontWeight: 'bold',
  },
  panelChat: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  encabezadoChat: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #ddd',
  },
  avatarGrande: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#888',
    color: 'white',
    fontSize: '30px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenedorMensajes: {
    flexGrow: 1,
    minHeight: 0,
    padding: '15px',
    backgroundColor: '#f9f9f9',
    overflowY: 'auto',
  },
  mensaje: {
    maxWidth: '70%',
    marginBottom: '10px',
    padding: '10px',
    borderRadius: '8px',
  },
  mensajeUsuario: {
  backgroundColor: '#d1e7dd',
  alignSelf: 'flex-end',
  marginLeft: 'auto',
  marginRight: '10px', 
},
mensajeInterlocutor: {
  backgroundColor: '#f8d7da',
  alignSelf: 'flex-start',
  marginRight: 'auto',
  marginLeft: '10px', 
},
  textoMensaje: {
    marginBottom: '5px',
  },
  metainfoMensajeUsuario: {
  fontSize: '12px',
  color: '#555',
  textAlign: 'right',
  marginTop: '5px',
},
metainfoMensajeInterlocutor: {
  fontSize: '12px',
  color: '#555',
  textAlign: 'left',
  marginTop: '5px',
},
  footerChat: {
    borderTop: '1px solid #ddd',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
     flexShrink: 0, 
  },
  inputMensaje: {
    flexGrow: 1,
    resize: 'none',
    padding: '10px',
    fontSize: '14px',
  },
  sinChatSeleccionado: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#888',
    fontSize: '18px',
  },
  burbujaNotificacion: {
  backgroundColor: '#007bff',
  color: 'white',
  borderRadius: '12px',
  padding: '2px 8px',
  fontSize: '12px',
  marginLeft: '8px',
  fontWeight: 'bold',
  display: 'inline-block',
},
};

export default ListaChats;

