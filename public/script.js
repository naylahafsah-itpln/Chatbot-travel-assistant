document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  // --- 1. VARIABEL BARU UNTUK MENAMPUNG RIWAYAT ---
  let chatHistory = []; 

  function simpleMarkdownToHtml(text) {
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    return html;
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // --- 2. SIMPAN PESAN USER KE DALAM HISTORY ---
    chatHistory.push({ role: 'user', text: userMessage });

    appendMessage('user', userMessage);
    userInput.value = '';

    const loadingMessage = appendMessage('bot', '<div class="loader"></div>', true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // --- 3. KIRIM SELURUH chatHistory, BUKAN CUMA PESAN TERAKHIR ---
        body: JSON.stringify({
          conversation: chatHistory, 
        }),
      });

      if (!response.ok) throw new Error('Failed to get response from server.');

      const data = await response.json();

      if (data && data.result) {
        loadingMessage.innerHTML = simpleMarkdownToHtml(data.result);
        
        // --- 4. SIMPAN JAWABAN BOT KE HISTORY AGAR KONTEKS TERJAGA ---
        chatHistory.push({ role: 'model', text: data.result });
        
      } else {
        loadingMessage.textContent = 'Sorry, no response received.';
      }
    } catch (error) {
      console.error('Error:', error);
      loadingMessage.textContent = 'Failed to get response from server.';
    }
  });

  function appendMessage(role, content, isHtml = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${role}-message`);
    if (isHtml) { messageElement.innerHTML = content; } 
    else { messageElement.textContent = content; }
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
  }
});