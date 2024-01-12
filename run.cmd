@echo off
setlocal enabledelayedexpansion

REM Check if there are no arguments
if "%1"=="" (
    echo Please provide an action you would like to perform:
    echo build - builds both projects: Blazor and WASM
    echo clean - removes the artifacts from the previous build
    echo cleanbuild - cleans the previous build and builds both projects: Blazor and WASM
    echo run - runs the Blazor project
    exit /b 1
)


REM Set the action from the first argument
set "action=%1"

REM Switch-case logic based on the action
:switch
    if "%action%"=="build" (
        call :build
        goto :end
    ) else if "%action%"=="clean" (
        call :clean
        goto :end
    ) else if "%action%"=="cleanbuild" (
        call :clean
        call :build
        goto :end
    ) else if "%action%"=="run" (
        dotnet run -p "blazorServer\blazorServer.csproj"
    ) else (
        echo Invalid project name: %action%
        exit /b 1
    )


REM Define functions
:build
    dotnet publish -c Debug "dotnet\QRGenerator.csproj"
    dotnet publish -c Debug "blazorServer\blazorServer.csproj"
    exit /b 0

:clean
    echo Cleaning the previous build...
    set "dotnetBin=dotnet\bin"
    set "dotnetObj=dotnet\obj"
    set "blazorBin=blazorServer\bin"
    set "blazorObj=blazorServer\obj"
    set "dotnetPublish=blazorServer\wwwroot\dotnet"
    if exist !dotnetBin! rmdir /s /q !dotnetBin!
    if exist !dotnetObj! rmdir /s /q !dotnetObj!
    if exist !blazorBin! rmdir /s /q !blazorBin!
    if exist !blazorObj! rmdir /s /q !blazorObj!
    if exist !dotnetPublish! rmdir /s /q !dotnetPublish!
    exit /b 0

:end