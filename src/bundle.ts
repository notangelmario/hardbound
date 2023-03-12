import { 
	esbuildInit, 
	esbuildBuild, 
	walk,
	esbuildDenoPlugin,
	esbuildSolidPlugin,
} from "./deps.ts";
import { DEV_MODE } from "./server.ts";


// Borrowed from fresh
// Uses esbuild native on machines that support Deno.run
// AKA Deno Deploy does not, so it uses the wasm version
let esbuildInitialized: boolean | Promise<void> = false;
async function ensureEsbuildInitialized() {
  if (esbuildInitialized === false) {
    if (Deno.run === undefined) {
      const wasmURL = new URL("./esbuild.wasm", import.meta.url).href;
      esbuildInitialized = fetch(wasmURL).then(async (r) => {
        const resp = new Response(r.body, {
          headers: { "Content-Type": "application/wasm" },
        });
        const wasmModule = await WebAssembly.compileStreaming(resp);
        await esbuildInit({
          wasmModule,
          worker: false,
        });
      });
    } else {
      esbuildInit({});
    }
    await esbuildInitialized;
    esbuildInitialized = true;
  } else if (esbuildInitialized instanceof Promise) {
    await esbuildInitialized;
  }
}


// This function gets the URL requested by the browser
// and returns the bundled code which is mapped one to one
// with the src folder.

export class Bundler {
	private cache: Map<string, Uint8Array> = new Map();
	private importMapPath: URL;
	private importMetaURL: string;
	private entryPoints: Record<string, string> = {};

	constructor(importMapPath: string, importMetaURL: string) {
		this.importMapPath = new URL(importMapPath);
		this.importMetaURL = importMetaURL;
	}

	public async getEntryPoints() {
		const pathToWalk = new URL("src", this.importMetaURL).pathname;
		const entryPoints: Record<string, string> = {};

		for await (const entry of walk(pathToWalk, { exts: [".js", ".jsx", ".ts", ".tsx"] })) {
			const path = entry.path.split("/src/").pop() ?? "";
			const key = this.getKey(path);

			entryPoints[key] = entry.path;
		}

		this.entryPoints = entryPoints;

		console.log(this.entryPoints);
	}

	public async get(path: string) {
		if (Object.keys(this.entryPoints).length === 0) {
			await this.getEntryPoints();
		}

		if (this.cache.has(path)) {
			return this.cache.get(path);
		}

		await this.bundle();
		if (!this.cache.has(path)) {
			return this.cache.get(path);
		}

		return this.cache.get(path);
	}


	private async bundle() {
		const absWorkingDir = Deno.cwd();
		await ensureEsbuildInitialized();

		try {
			const bundle = await esbuildBuild({
				entryPoints: this.entryPoints,
				outdir: "_hb",
				outfile: "",
				bundle: true,
				format: "esm",
				platform: "neutral",
				target: ["chrome99", "firefox99", "safari14"],
				absWorkingDir,
				minify: !DEV_MODE,
				minifyIdentifiers: !DEV_MODE,
				minifySyntax: !DEV_MODE,
				minifyWhitespace: !DEV_MODE,
				treeShaking: true,
				splitting: true,
				chunkNames: "chunk-[hash]",
				write: false,
				jsx: "transform",
				inject: [`./src/auto-import.js`],
				jsxImportSource: "solid-js",
				jsxFactory: "h",
				plugins: [
					esbuildDenoPlugin({
						importMapURL: this.importMapPath,
					}),
					esbuildSolidPlugin({
						solid: {
							generate: "dom",
							hydratable: false,
						},
					})
				]
			});

			const { outputFiles } = bundle;
			const cache = new Map<string, Uint8Array>()
			for (const file of outputFiles) {
				const path = file.path.split("/_hb/").pop() ?? "";
				const key = this.getKey(path);
				cache.set(key, file.contents);
			}
			this.cache = cache;

		} catch {
			return "There was an error bundling the file.";
		}
	}

	public getKey(path: string) {
		// Create key from path
		// by removing the _hb folder and everything before it
		// remove the file extension which can be js, jsx, ts, or tsx
		// and turning slashes into dashes
		return path.replace(/\.(js|jsx|ts|tsx)$/, "")
			.replace(/\//g, "-");
	}
}
