# Imaggio

![Imaggio app](https://github.com/whois-team/imaggio/raw/main/screenshot.png)  

Imaggio is an open source file manipulation tool, windows desktop application built on Electron. Handles conversion, compression, slice and dice in multiple ways geared towards PDF files. If you ever thought about the privacy and data security implications regarding use of online converters, wonder no more, Imaggio does all the PDF slice and dice on your machine. This is meant to be a simple intuitive application for any user. Select your action, select/drag n'drop your file and done.

This application is mostly a GUI for several different binaries that interact with (but not limited to) PDF files, these binaries are `Ghostscript`, `ImageMagick`, `OfficeToPdf`, `Poppler`, `qpdf`, `pandoc` and `exiftool`. They're not all in use but they maybe used in some way in the future and that's why they're there.

## Index

- [Requirements](#requirements)
- [Notes on binaries](#notes-on-binaries)
- [Features](#features)
- [Quick Start](#quick-start)
- [Building](#building)
- [Built with](#built-with)
- [License](#license)

## Requirements

Imaggio is a standalone application that only requires Microsoft Office for "document to PDF" conversions. If you don't need these type of conversions there's no other specific requirement.

## Notes on binaries

The included binaries have been UPX (--ultra-brute) compressed for manageability. If that does not suit your use case for some specific reason there are mirror repositories of these binaries on github.

Purpose of the binaries

- `ghostscript` is used for compression tasks and pdfa conversion
- `poppler` is used for PDF to graphic formats conversions, extractions, split and detach
- `officetopdf` is used for document to pdf conversions
- `imagemagick` is used for image to grayscale
- `exiftool` is used for metadata manipulation

## Features

- Open source, customizable to your needs
- MIT Licensed, except third-party binaries
- Local file manipulation
- Better privacy, no tracking
- Single file processing
- Folder processing for bulk workloads
- Array of common manipulation tasks available
  - PDF to JPEG (low, medium, high)
  - PDF to PNG (low, medium, high)
  - PDF to SVG
  - Document to PDF [Word, Excel, PowerPoint, etc...] (7 options)
  - Compress PDF (low, medium, high)
  - Split PDF, 1 PDF per page
  - Extract images from PDF, 1 file per image
  - Extract text from PDF, .txt format
  - Convert to PDF/A
  - Compress and convert to PDF/A (3 options)
  - Metadata (remove or clone from one to another)
  - Image file to grayscale
- Application translation support via .json file
  - en-US - American English, (default)
  - pt-PT - Portugal Portuguese

### Planned features

- Customizable PDF stamping
- Join PDF files

### Features QA

Q: Can i change the output filename or folder?

A: No, it's not planned to be allowed changes to the output in any way. Output files are default defined and won't be changed.

Q: Will you support Linux and MacOS?

A: No, i won't support Linux or MacOS, however you're free to contribute a port to these OSes.

Q: Can i convert [insert humongous number] files?

A: You can but i wouldn't recommend, it will probably take a long time. I'd use this for a simple workflow of upwards of 5000 files or so.

Q: Can I get fine tuning options?

A: No, this tool is meant for general, fast, major use case scenarios, if you want fine tuning you'll have to use the original binaries and their command line parameters.

Q: Why can't i drop a file on "clone metadata" option?

A: To be clear you've selected either source or target file, this is by design.

Q: How can i change the language?

A: You can't, language is detected at application startup, defaults to `en-US` locale. However you can contribute with a translation from `en-US`to another locale, you can find the base file inside `app/js/locale/en-US.json`.

## Quick Start

Stay on the bleeding edge of imaggio commits using `git clone` or for slightly tested version download the latest built release.

### File output

Files used in the application will not be modified, the output files will have `min` or number to indicate and distinguish the file as well as `jpg` or whatever extension is appropriate to the chosen option. Along with that you're able to distinguish these processed files by looking at the modification date with explorer's list view.

### Notes on scripts

These executable files inside the `scripts` folder are meant to launch or kill imaggio easily, used just for debugging/testing purposes. Were made with AutoIt and are decompilable, source inside `app/etc`.

### Latest built binary

Check out and download the latest release.

![Latest tag](https://img.shields.io/github/tag/whois-team/imaggio.svg?label=Latest%20tag&style=flat)
[![Check out releases](https://img.shields.io/badge/Checkout%20releases-%20-orange.svg)](https://github.com/whois-team/imaggio/releases)

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

or 

```
npm run build
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
