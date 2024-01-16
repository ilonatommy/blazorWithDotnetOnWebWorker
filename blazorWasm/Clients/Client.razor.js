let dotnetWorker;
let exports = null;
let homeID;

export function setUpWorker(id) {
    homeID = id;
    dotnetWorker = new Worker('./Workers/QRGenerator.razor.js', { type: "module" } );

    dotnetWorker.addEventListener('message', async function(e) {
        switch (e.data.command)
        {
            case "exportsReady":
                const { getAssemblyExports } = await globalThis.getDotnetRuntime(0);
                exports = await getAssemblyExports("blazorWasm.dll");
                exports.Client.SetExportsReady(homeID);
                break;
            case "error":
                if (e.data.message === undefined)
                    new Error("Inner error, got empty error message from worker");
                exports.Client.DisplayError(homeID, e.data.message);
                break;
            case "generateQRCodeResponse":
                if (e.data.image === undefined)
                    new Error("Inner error, got empty QR image from worker");
                const blob = new Blob([e.data.image], { type: 'image/png' });
                const url = URL.createObjectURL(blob);
                exports.Client.UpdateImage(homeID, url);
                break;
            default:
                console.log('Worker said: ', e.data);
                break;
        }
    }, false);
};

export function launchDotnet() {
    if (!dotnetWorker)
    {
        throw new Error("Set up the webworker before launching.");
    }
    dotnetWorker.postMessage({ command: "startDotnet" });
};

export function generate(text, size) {
    if (!exports)
    {
        throw new Error("Exports not ready yet, cannot generate QR code");
    }
    dotnetWorker.postMessage({ command: "generateQRCode", text: text, size: size });
}