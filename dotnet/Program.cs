// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.
using System;
using System.Runtime.InteropServices.JavaScript;
using QRCoder;

// https://github.com/codebude/QRCoder

Console.WriteLine("Hello, Browser!");

public partial class QRGenerator
{
    private static readonly int MAX_QR_SIZE = 20;

    [JSExport]
    internal static string Generate(string text, int qrSize)
    {
        if (qrSize >= MAX_QR_SIZE)
        {
            SendErrorMessage($"QR code size must be less than {MAX_QR_SIZE}. Try again.");
            return "";
        }
        QRCodeGenerator qrGenerator = new QRCodeGenerator();
        QRCodeData qrCodeData = qrGenerator.CreateQrCode("The text which should be encoded.", QRCodeGenerator.ECCLevel.Q);
        BitmapByteQRCode qrCode = new BitmapByteQRCode(qrCodeData);
        return Convert.ToBase64String(qrCode.GetGraphic(qrSize));
    }

    [JSImport("QRGenerator.sendErrorMessage", "dotnetWorker.js")]
    internal static partial void SendErrorMessage(string message);
}
