using System.Runtime.InteropServices.JavaScript;
using System.Runtime.Versioning;
using System.Collections.Generic;
using blazorWasm.Pages;

[SupportedOSPlatform("browser")]
public partial class ClientInterop
{
    public static Dictionary<string, Home> HomeInstances = new();

    [JSImport("setUpWorker", nameof(ClientInterop))]
    public static partial void SetUpWorker(string id);

    [JSImport("launchDotnet", nameof(ClientInterop))]
    public static partial void LaunchDotnet();

    [JSImport("generate", nameof(ClientInterop))]
    public static partial void GenerateQR(string text, int size);

    [JSExport]
    public static void SetExportsReady(string id) => HomeInstances[id].SetExportsReady();

    [JSExport]
    public static void UpdateImage(string id, string url) => HomeInstances[id].UpdateImage(url);

    [JSExport]
    public static void DisplayError(string id, string message) => HomeInstances[id].DisplayError(message);
}