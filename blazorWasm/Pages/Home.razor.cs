using Microsoft.AspNetCore.Components;
using System.Runtime.InteropServices.JavaScript;
using System.Runtime.Versioning;
using Components;

namespace Pages;

[SupportedOSPlatform("browser")]
public partial class Home : ComponentBase, IDisposable
{
    public string ID;
    private string ImageUrl = string.Empty;
    private bool exportsReady;
    private bool dotnetStarted;
    private string text = "Type text to generate QR";
    private int size = 5;
    private Popup popup = new Popup();

    public Home()
    {
        ID = Guid.NewGuid().ToString();
    }

    protected override void OnInitialized() => Client.HomeInstances.Add(ID, this);
    
    public void Dispose() => Client.HomeInstances.Remove(ID);

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (dotnetStarted)
            return;
        await JSHost.ImportAsync(
            moduleName: nameof(QRGenerator),
            moduleUrl: $"../Workers/QRGenerator.razor.js");
        await JSHost.ImportAsync(
            moduleName: nameof(Client),
            moduleUrl: $"../Clients/Client.razor.js");
        Client.SetUpWorker(ID);
        Client.LaunchDotnet();
        dotnetStarted = true;
    }

    private void GenerateQR()
    {
        if (!exportsReady)
        {
            throw new Exception("Exports not ready yet, cannot generate QR code");
        }
        Client.GenerateQR(text, size);
    }

    public void SetExportsReady()
    {
        exportsReady = true;
        InvokeAsync(StateHasChanged);
    }

    public void UpdateImage(string url)
    {
        ImageUrl = url;
        InvokeAsync(StateHasChanged);
    }

    public void DisplayError(string message)
    {
        ImageUrl = string.Empty;
        InvokeAsync(StateHasChanged);
        popup.Show(title: "Error", message: message);
    }
}