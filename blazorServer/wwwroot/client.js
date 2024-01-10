// keep in conditions to avoid re-defining
if (!window.clientHelpers) {
    window.clientHelpers = {
        exportsReady: false,
        dotnetWorker: null,
    }
}

if (!window.clientFunctions)
{
    window.clientFunctions = {
        setUpWorker: async function() {
            window.clientHelpers.dotnetWorker = new Worker('dotnet/wwwroot/worker.js', { type: "module" } );
    
            window.clientHelpers.dotnetWorker.addEventListener('message', function(e) {
                switch (e.data.command)
                {
                    case "exportsReady":
                        window.clientHelpers.exportsReady = true;
                        console.log("Received exports ready");
                        DotNet.invokeMethodAsync('blazorServer', 'MyInteropMethods.SetExportsReady');
                        break;
                    case "error":
                        if (e.data.message === undefined)
                            new Error("Inner error, got empty error message from worker");
                        // window.clientHelpers.eventEmitter.emit('errorOccurred', e.data.message);
                        break;
                    case "generateQRCodeResponse":
                        if (e.data.image === undefined)
                            new Error("Inner error, got empty QR image from worker");
                        const blob = new Blob([e.data.image], { type: 'image/png' });
                        const url = URL.createObjectURL(blob);
                        DotNet.invokeMethodAsync('blazorServer', 'MyInteropMethods.SetQRCodeImage', url);
                        break;
                    default:
                        console.log('Worker said: ', e.data);
                        break;
                }
            }, false);
        },
        launchDotnet: function() {
            if (!window.clientHelpers.dotnetWorker)
            {
                throw new Error("Set up the webworker before launching.");
            }
            window.clientHelpers.dotnetWorker.postMessage({ command: "startDotnet" });
        },
        generate: function(text="ala", size=10) {
            if (!window.clientHelpers.exportsReady)
            {
                throw new Error("Exports not ready yet, cannot generate QR code");
            }
            window.clientHelpers.dotnetWorker.postMessage({ command: "generateQRCode", text: text, size: size });
        }
    };
}