let dotnetWorker;
let exportsReady;
let exports;
let homeID;;

export function setUpWorker(id) {
    homeID = id;
    dotnetWorker = new Worker('dotnet/wwwroot/worker.js', { type: "module" } );

    dotnetWorker.addEventListener('message', async function(e) {
        switch (e.data.command)
        {
            case "exportsReady":
                exportsReady = true;
                const { getAssemblyExports } = await globalThis.getDotnetRuntime(0);
                exports = await getAssemblyExports("blazorWasm.dll");
                exports.ClientInterop.SetExportsReady(homeID);
                break;
            case "error":
                if (e.data.message === undefined)
                    new Error("Inner error, got empty error message from worker");
                exports.ClientInterop.DisplayError(homeID, e.data.message);
                break;
            case "generateQRCodeResponse":
                if (e.data.image === undefined)
                    new Error("Inner error, got empty QR image from worker");
                const blob = new Blob([e.data.image], { type: 'image/png' });
                const url = URL.createObjectURL(blob);
                exports.ClientInterop.UpdateImage(homeID, url);
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
    if (!exportsReady)
    {
        throw new Error("Exports not ready yet, cannot generate QR code");
    }
    dotnetWorker.postMessage({ command: "generateQRCode", text: text, size: size });
}