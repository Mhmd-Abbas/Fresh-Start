async function sendMessage() {
    const userInput = document.getElementById("userInput");
    const chatbox = document.getElementById("chatbox");

    let message = userInput.value.trim();
    if (!message) return;

    // Add user message to chatbox
    //chatbox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
    chatbox.innerHTML += `
                <div class="message received">
                    <p class="message-text">${message}</p>
                </div>
    `
    userInput.value = '';

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();
        if (data.reply) {
            //chatbox.innerHTML += `<p><strong>Fresh start:</strong> ${data.reply}</p>`;
            chatbox.innerHTML += `
                        <div class="message sent">
                            <p class="message-text">${data.reply}</p>
                        </div>
            `
        } else {
            //chatbox.innerHTML += `<p><strong>Fresh start:</strong> ⚠️ No response from AI.</p>`;
            chatbox.innerHTML += `
            <div class="message sent">
                <p class="message-text">⚠️ No response from AI.</p>
            </div>
            `
        }
    } catch (error) {
        //chatbox.innerHTML += `<p><strong>Fresh start:</strong> ❌ Server Error.</p>`;
        chatbox.innerHTML += `
        <div class="message sent">
            <p class="message-text">❌ Server Error.</p>
        </div>
        `
    }
}
