document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get('geminiApiKey', (data) => {
    document.getElementById('key').value = data.geminiApiKey || '';
  });

  document.getElementById('save').addEventListener('click', () => {
    const key = document.getElementById('key').value.trim();
    if (!key) {
      alert('Please enter a valid API key.');
      return;
    }
    chrome.storage.sync.set({ geminiApiKey: key }, () => {
      alert('API key saved successfully!');
      window.close();
    });
  });
});