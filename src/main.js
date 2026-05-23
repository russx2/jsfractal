import '../css/style.css';

window.addEvent('domready', () => {
  if (!document.createElement('canvas').getContext) {
    $('wrapper').setStyle('display', 'none');
    $('non-compatible').setStyle('display', 'block');
    return;
  }

  window.JSF = new window.JSFractal('fractal_container', 'fractal', 'history');
});
