# Imaggio

![Imaggio app](https://github.com/eduardomota/imaggio/raw/main/screenshot.png)  

Imaggio is an open source, windows desktop application built on Electron. Handles conversion, compression, slice and dice in multiple ways with PDFs in mind. If you ever thought about the privacy and data security concerns regarding use of online converters, wonder no more, Imaggio does all the PDF slice and dice locally. This is meant to be a simple intuitive application for any user.

This application is basically a GUI for several different binaries that interact with PDF files, these binaries are `Ghostscript`, `ImageMagick`, `OfficeToPdf`, `Poppler`, `qpdf` and `pandoc`. They're not all in use but they maybe used in some way in the future and thats why they're there.

## Requirements

Imaggio is a standalone application that only requires Microsoft Office for "document to PDF" conversions. If you don't need these type of conversions there's no other specific requirement.

## Notes on binaries

The included binaries have been UPX (--ultra-brute) compressed for manageability. If that does not suit your use case for some specific reason there are mirror repositories of these binaries on github.

## Features

- Local file manipulation
- Open source, customizable to your needs
- Better privacy, no tracking
- Folder processing for bulk workloads
- Single file processing
- PDF to JPEG (3 options)
- PDF to PNG (3 options)
- PDF to SVG
- Document to PDF [Word, Excel, PowerPoint, etc...] (7 options)
- Compress PDF (3 options)
- Split PDF, 1 PDF per page
- Extract images from PDF, 1 file per image
- Extract text from PDF, .txt format
- Convert to PDF/A
- Compress and convert to PDF/A (3 options)

### Planned features

- Customizable PDF stamping

### Features QA

Q: Can i change the output filename or folder?
A: No, it's not planned to be allowed changes to the output in any way.

Q: Will you support Linux and MacOS?
A: No, i won't be making Linux or MacOS supported, however you're free to contribute to this compatibility if you wish to.

Q: Can i convert 1 million files (or humongous quantity of files)?
A: You can but i wouldnt recommend, this converter runs sequentially so it will probably take a long time.

Q: Can I get fine tuning options?
A: No, this tool is meant for general, fast use, major use case scenarios, if you want fine tuning you'll have to use the original binaries and their command line parameters.

## Quick Start

Stay on the bleeding edge of imaggio commits using `git clone` or for slightly tested version download the latest built release.

### File output

Files used in the application will not be modified, the output files will have "min", a number or the file extension appended so you're able to distinguish from the original file. Along with that you're able to distinguish also from the modification date with list view.

### Latest built binary

Check out and download the latest release for your architecture/OS.

![Latest tag](https://img.shields.io/github/tag/eduardomota/imaggio.svg?label=Latest%20tag&style=flat)
[![Check out releases](https://img.shields.io/badge/Checkout%20releases-%20-orange.svg)](https://github.com/eduardomota/imaggio/releases)

### Latest changes

Basic Imaggio requirements are `node`, `npm` and `git`.

Clone Imaggio code and install dependencies

```
git clone https://github.com/eduardomota/imaggio
npm install
```

After clone, run using

```
npm start
```

## Building

Imaggio uses electron-packager for builds.

```
electron-packager . imaggio --overwrite --platform=win32 --arch=ia32 --icon=app/icons/app.ico --prune=true --out=release_builds --version-string.CompanyName=\"\" --version-string.FileDescription=\"NAME\" --version-string.ProductName=\"PRODUCTNAME\""

```

## Built with

<a href="https://electronjs.org/"><img height=40px src="https://electronjs.org/images/electron-logo.svg"></a>

<a href="https://jquery.org/"><img height=40px src="https://upload.wikimedia.org/wikipedia/en/9/9e/JQuery_logo.svg"></a>

<a href="https://bulma.io/"><img height=40px src="https://bulma.io/images/made-with-bulma.png"></a>

<a href="https://poppler.freedesktop.org/"><img height=100px src="https://poppler.freedesktop.org/logo.png"></a>

<a href="https://www.ghostscript.com/"><img height=100px src="https://www.ghostscript.com/images/ghostscript_logo.png"></a>

## License

Distributed under MIT License. See `license.md` for more information.

Additionally when using Imaggio or other GitHub Logos, please refer to [GitHub logo guidelines](https://github.com/logos).
