const panels = {
  protocol: document.querySelector('#protocol-panel')
};

function setPanel(name){
  Object.entries(panels).forEach(([key, panel]) => panel?.classList.toggle('active', key === name));
  document.querySelectorAll('[data-panel]').forEach((button) => button.classList.toggle('active', button.dataset.panel === name));
}

document.addEventListener('click', (event) => {
  const panelButton = event.target.closest('[data-panel]');
  if(panelButton){
    setPanel(panelButton.dataset.panel);
  }
});
