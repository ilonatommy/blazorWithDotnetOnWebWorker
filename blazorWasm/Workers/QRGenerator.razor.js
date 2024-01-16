// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.
import { dotnet, exit } from '../_framework/dotnet.js'

let assemblyExports = null;

self.addEventListener('message', async function(e) {
    switch (e.data.command)
    {
        case "startDotnet":
            console.log("Starting dotnet, says the worker");
            await startDotnet();
            break;
        case "generateQRCode":
            if (!assemblyExports)
                throw new Error("Exports not found");
            const size = Number(e.data.size);
            const text = e.data.text;
            if (size === undefined || text === undefined)
                new Error("Inner error, got empty QR generation data from React");
            const imageBytes = assemblyExports.QRGenerator.Generate(text, size);
            self.postMessage({ command: "generateQRCodeResponse", image: imageBytes.buffer }, [imageBytes.buffer]);
        default:
            self.postMessage(e.data.command);
            break;
    }
    }, false);

async function startDotnet(){
    try {
        self.postMessage("creating dotnet");
        const { setModuleImports, getAssemblyExports, getConfig } = await dotnet
            .create();
        self.postMessage("getting config");
        const config = getConfig();
        self.postMessage("getting exports");
        assemblyExports = await getAssemblyExports(config.mainAssemblyName);
    
        self.postMessage("setting imports");
        setModuleImports("worker.razor.js", {
            QRGenerator: {
                sendErrorMessage
            }
        });
    
        self.postMessage({ command: "exportsReady" });
        self.postMessage("starting dotnet");
        await dotnet.run();
    }
    catch (err) {
        console.log(`err: ${err}; ${err.message}`);
        exit(2, err);
    }
}

export function sendErrorMessage(message) {
    console.log(`sendErrorMessage is passing message: ${message}`);
    self.postMessage({ command: "error", message: message });
}