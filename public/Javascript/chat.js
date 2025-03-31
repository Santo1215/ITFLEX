function sendMessage() {
    let input = document.getElementById('message-input');
    let message = input.value.trim();
    if (message !== "") {
        let chatBox = document.getElementById('chat-box');
        let msgElement = document.createElement('div');
        msgElement.classList.add('message');
        msgElement.textContent = message;
        chatBox.appendChild(msgElement);
        chatBox.scrollTop = chatBox.scrollHeight;
        input.value = "";
    }
}

function scrollToBottom() {
    const chatBox = document.querySelector(".chat-box");
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Agregar evento para la tecla Enter cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", function() {
    const inputField = document.getElementById("message-input");
    
    // Evento para la tecla Enter
    inputField.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Evita el salto de línea en el input
            sendMessage();
        }
    });
});