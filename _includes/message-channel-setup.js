      // a promise that resolves when the rendering is ready (or rejects if it
      // fails); can be used to show the display or an error instead
      let resolveRender;
      let rejectRender;
      const readyPromise = new Promise((resolve, reject) => {
        resolveRender = resolve;
        rejectRender = reject;
      });

      // Setup communication channel for use by the template code in the iframe
      renderer.onload = () => {
        // create a MessageChannel; transfer one port to the iframe
        const channel = new MessageChannel();
        // start message queue so messages won't be lost while iframe loads
        channel.port1.start();
        // handle `ready` message
        channel.port1.onmessage = function ready(event) {
          if(event.data === 'ready') {
            // unhide the iframe because it's ready
            resolveRender();
          } else {
            rejectRender(new Error(event.data?.error?.message));
          }
          channel.port1.onmessage = undefined;
        };
        // send "start" message; send `port2` to iframe for return communication
        renderer.contentWindow.postMessage('start', '*', [channel.port2]);
      };

      // setup event responses to ready or error
      // NOTE: this section is idiosyncratic to the Wallet/Renderer's UX needs
      readyPromise.then(() => {
        console.log('rendering ready');
        const renderer = document.getElementById('renderer');
        renderer.hidden = false;
      }).catch(err => {
        const errorMessage = document.getElementById('error-message');
        errorMessage.style.display = 'block';
        errorMessage.innerText = 'Rendering failed: ' + err.message;
        console.error('rendering failed', err);
      });