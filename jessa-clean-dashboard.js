const panels = {
  protocol: document.querySelector('#protocol-panel'),
  connections: document.querySelector('#connections-panel')
};

function setPanel(name){
  Object.entries(panels).forEach(([key, panel]) => panel?.classList.toggle('active', key === name));
  document.querySelectorAll('[data-panel]').forEach((button) => button.classList.toggle('active', button.dataset.panel === name));
}

function setGoogleConnectionStatus({connected = false, message = '', error = ''} = {}){
  const status = document.querySelector('#google-connection-status');
  const link = document.querySelector('#google-connect-link');
  if(!status) return;
  status.classList.toggle('connected', connected);
  status.classList.toggle('failed', !!error);
  const label = connected ? 'Google is connected.' : 'Google is not connected yet.';
  status.querySelector('strong').textContent = error || message || label;
  if(link) link.textContent = connected ? 'Reconnect Google' : 'Connect Google';
}

async function refreshGoogleConnectionStatus(){
  try{
    const response = await fetch('/api/setup-health', {credentials: 'same-origin'});
    const data = await response.json().catch(() => ({}));
    if(!response.ok) throw new Error(data.error || 'Could not check Google connection.');
    const google = data.google || {};
    if(google.connected){
      setGoogleConnectionStatus({connected: true});
    }else{
      setGoogleConnectionStatus({message: google.setupMessage || google.error || 'Connect Google to give VAL Gmail, Calendar, Drive, and Docs context.'});
    }
  }catch(error){
    setGoogleConnectionStatus({error: error.message || 'Could not check Google connection.'});
  }
}

document.addEventListener('click', (event) => {
  const panelButton = event.target.closest('[data-panel]');
  if(panelButton){
    setPanel(panelButton.dataset.panel);
  }
});

refreshGoogleConnectionStatus();
