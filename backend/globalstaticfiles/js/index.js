document.getElementById('sendEmailBtn').addEventListener('click', function () {
    const recipient = document.getElementById('email-recipient').value;

    fetch(`${window.location.origin}/test/email`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipient: recipient })
    })
    .then(response => response.json())
    .then(data => {
        alert('Success: ' + JSON.stringify(data));
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to send request.');
    });
});

// Helper function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(trimmed.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}