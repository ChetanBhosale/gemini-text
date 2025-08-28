async function getCorrection(text, key) {
  const prompt = `Correct the grammar, spelling, and wording of the provided text into a single, concise sentence in good English. Do not include explanations or options.\n\n<user_input>${text}</user_input>`;
  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts[0].text) {
    throw new Error('Invalid response from Gemini API');
  }
  const corrected = data.candidates[0].content.parts[0].text.trim();
  const match = corrected.match(/<output>(.*?)<\/output>/s) || corrected.match(/^(.+?)(?=\n|$)/);
  return match ? match[1].trim() : corrected;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  let el = document.activeElement;
  console.log('Active Element:', {
    tagName: el.tagName,
    type: el.type,
    contentEditable: el.isContentEditable,
    value: el.value || el.innerText
  });

  if (el && el.ownerDocument !== document) {
    const iframe = el.ownerDocument.defaultView.frameElement;
    if (iframe) {
      console.log('Inside iframe, attempting to focus parent document');
      el = document.activeElement;
    }
  }

  const isContentEditable = el && el.isContentEditable;
  const isInput = el && el.tagName === 'INPUT' && ['text', 'search', 'email'].includes(el.type.toLowerCase());
  const isTextarea = el && el.tagName === 'TEXTAREA';

  if (!el || !(isContentEditable || isInput || isTextarea)) {
    alert('Please focus on a text input, textarea, or contenteditable element.');
    return true;
  }

  const originalText = isContentEditable ? el.innerText : el.value;
  if (!originalText.trim()) {
    alert('No text to correct in the focused element.');
    return true;
  }

  if (msg.action === 'openModal' || msg.action === 'autoCorrect') {
    const tempText = isContentEditable ? 'Loading...' : el.value = 'Loading...';
    if (isContentEditable) el.innerText = tempText;

    chrome.storage.sync.get('geminiApiKey', async (data) => {
      const key = data.geminiApiKey;
      if (!key) {
        alert('Please set your Gemini API key in the extension popup (click the icon in the toolbar).');
        if (isContentEditable) el.innerText = originalText;
        else el.value = originalText;
        return;
      }

      try {
        const corrected = await getCorrection(originalText, key);
        if (isContentEditable) {
          el.innerText = corrected;
        } else {
          el.value = corrected;
        }
      } catch (e) {
        alert(`Error correcting text: ${e.message}`);
        if (isContentEditable) el.innerText = originalText;
        else el.value = originalText;
      }
    });
  }

  return true;
});