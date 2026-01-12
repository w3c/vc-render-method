// add promise that will resolve to the communication port from
// the parent window
const portPromise = new Promise(resolve => {
  window.addEventListener('message', function start(event) {
    if(event.data === 'start' && event.ports?.[0]) {
      window.removeEventListener('message', start);
      resolve(event.ports[0]);
    }
  });
});

// attach a function to the window for the template to call when
// it's "ready" (or that an error occurred) that will send a message
// to the parent so the parent can decide whether to show the iframe
window.renderMethodReady = function(err) {
  portPromise.then(port => port.postMessage(
    !err ? 'ready' : {error: {message: err.message}}));
};