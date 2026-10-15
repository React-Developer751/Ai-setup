// Where the page finds the WebAssembly runtime of the embedding model. Vite turns these imports into addresses of files it serves
// (in development) or copies with the build (hashed names). Plain file paths: the package's "exports" list does not offer these files. Only the "asyncify" variant is used: it runs in every modern browser.
import wasmModule from '../../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.mjs?url'
import wasmBinary from '../../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.wasm?url'

export const wasmPaths = { mjs: wasmModule, wasm: wasmBinary }
