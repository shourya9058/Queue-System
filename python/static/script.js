// Theme Toggle
document.getElementById('themeToggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
  
  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Text-to-Speech
  function speak(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1;
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      showNotification('Text-to-speech not supported', 'warning');
    }
  }
  
  // Notifications
  function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => notification.classList.remove('show'), 3000);
  }
  
  // Booking Form
  document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const booking = {
      serviceType: document.getElementById('serviceType').value,
      date: document.getElementById('bookingDate').value,
      time: document.getElementById('bookingTime').value,
      name: document.getElementById('customerName').value.trim()
    };
  
    if (!booking.name) {
      showNotification('Please enter your name', 'warning');
      return;
    }
  
    try {
      const response = await fetch('/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
  
      if (response.ok) {
        showNotification('Booking successful!', 'success');
        document.getElementById('bookingForm').reset();
        await updateQueueDisplay();
      }
    } catch (error) {
      showNotification('Booking failed!', 'error');
      console.error('Error:', error);
    }
  });
  
  // Queue Display
  async function updateQueueDisplay() {
    try {
      const response = await fetch('/queue');
      const queue = await response.json();
      
      const queueList = document.getElementById('queueList');
      queueList.innerHTML = queue.map((customer, index) => `
        <div class="queue-item ${customer.serviceType}">
          <div>
            <h3>${customer.name}</h3>
            <p>${customer.serviceType.toUpperCase()} • ${customer.time}</p>
          </div>
          <span class="queue-number">#${index + 1}</span>
        </div>
      `).join('');
  
    } catch (error) {
      console.error('Error updating queue:', error);
    }
  }
  
  // Call Next Customer
  async function callNextCustomer() {
    try {
      const response = await fetch('/next', { method: 'POST' });
      const result = await response.json();
      
      if (result.message) {
        const customerDisplay = document.getElementById('currentCustomer');
        customerDisplay.textContent = result.message;
        speak(result.message);
        await updateQueueDisplay();
      }
    } catch (error) {
      showNotification('Error calling next customer!', 'error');
      console.error('Error:', error);
    }
  }
  
  // Initialize
  setInterval(updateQueueDisplay, 3000);
  updateQueueDisplay();

  