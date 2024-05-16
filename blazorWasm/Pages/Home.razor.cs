// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

using Microsoft.AspNetCore.Components;
using System.Runtime.InteropServices.JavaScript;
using System.Runtime.Versioning;
using Components;

namespace Pages;

[SupportedOSPlatform("browser")]
public partial class Home : ComponentBase
{
    private string ImageUrl = string.Empty;
    private string text = "Type text to generate QR";
    private int size = 5;
    private Popup popup = new Popup();

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await Client.InitClient();
    }

    private async Task GenerateQR()
    {
        try
        {
            ImageUrl = await Client.GenerateQR(text, size);
        }
        catch(Exception ex)
        {
            ImageUrl = string.Empty;
            popup.Show(title: "Error", message: ex.Message);
        }
        InvokeAsync(StateHasChanged);
    }
}