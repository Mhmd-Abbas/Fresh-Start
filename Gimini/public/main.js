async function sendMessage() {
    const userInput = document.getElementById("userInput");
    const chatbox = document.getElementById("chatbox");

    let message = userInput.value.trim();
    if (!message) return;

    // Add user message to chatbox
    chatbox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
    userInput.value = '';

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();
        if (data.reply) {
            chatbox.innerHTML += `<p><strong>Bot:</strong> ${data.reply}</p>`;
        } else {
            chatbox.innerHTML += `<p><strong>Bot:</strong> ⚠️ No response from AI.</p>`;
        }
    } catch (error) {
        chatbox.innerHTML += `<p><strong>Bot:</strong> ❌ Server Error.</p>`;
    }
}
