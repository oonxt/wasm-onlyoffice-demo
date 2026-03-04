# wasm-onlyoffice-demo

Demo apps for [wasm-onlyoffice-sdk](https://github.com/oonxt/wasm-onlyoffice-sdk) — an offline OnlyOffice document editor SDK for React and Vue, powered by WebAssembly.

## SDK

| | |
|---|---|
| npm | `npm install wasm-onlyoffice-sdk` |
| GitHub | https://github.com/oonxt/wasm-onlyoffice-sdk |

## Prerequisites

Both demos require the SDK to be built locally first (until a stable npm release is available):

```bash
cd ../wasm-onlyoffice-sdk
npm install && npm run build
```

The `public/` directory contains the required static assets:
- `public/v9.3.0.24-1/` — OnlyOffice web-apps
- `public/x2t-1/` — x2t WASM converter

## React Demo

```bash
cd react-demo
npm install
npm run dev
# → http://localhost:5173
```

## Vue Demo

```bash
cd vue-demo
npm install
npm run dev
# → http://localhost:5174
```

## Features Demonstrated

- New document (DOCX / XLSX / PPTX)
- Open local file via file picker
- Theme switching (light, dark, night, etc.)
- Save / Download (via browser download)
