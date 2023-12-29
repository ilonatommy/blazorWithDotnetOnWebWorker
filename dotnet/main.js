
class EventEmitter {
    constructor() { this.events = {}; }
  
    on(eventName, callback) {
      if (!this.events[eventName]) 
        this.events[eventName] = [];
      this.events[eventName].push(callback);
    }
  
    emit(eventName, ...args) {
      if (this.events[eventName])
        this.events[eventName].forEach((callback) => callback(...args));
    }
}

window.mainThread = {
    setUpWorker: async function() {
        dotnetWorker = new Worker('dotnet/dotnetWorker.js', { type: "module" } );

        dotnetWorker.addEventListener('message', function(e) {
            switch (e.data.command)
            {
                case "exportsReady":
                    exportsReady = true;
                    console.log("Received exports ready");
                    eventEmitter.emit('exportsReady');
                    break;
                case "error":
                    if (e.data.message === undefined)
                        new Error("Inner error, got empty error message from worker");
                    eventEmitter.emit('errorOccurred', e.data.message);
                    break;
                case "generateQRCodeResponse":
                    if (e.data.image === undefined)
                        new Error("Inner error, got empty QR image from worker");
                    document.getElementById("qrImage").src = `data:image/bmp;base64, ${e.data.image}`;
                default:
                    console.log('Worker said: ', e.data);
                break;
            }
        }, false);
    },
    launchDotnet: function() {
        if (!dotnetWorker)
        {
            throw new Error("Set up the webworker before launching.");
        }
        dotnetWorker.postMessage({ command: "startDotnet" });
    },
    generate: function(text="ala", size=10) {
        if (!exportsReady)
        {
            throw new Error("Exports not ready yet, cannot generate QR code");
        }
        dotnetWorker.postMessage({ command: "generateQRCode", text: text, size: size });
    },
    eventEmitter: new EventEmitter()
};
