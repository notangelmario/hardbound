import { 
	esbuildInit, 
	esbuildBuild, 
	extname,
	esbuildDenoPlugin,
	esbuildSolidPlugin,
} from "./deps.ts";


await esbuildInit({
	// wasmURL: new URL("./esbuild.wasm", import.meta.url).href,
	// worker: false
});


// This function gets the URL requested by the browser
// and returns the bundled code which is mapped one to one
// with the src folder.
export async function bundle(path: string, importMapURL: URL) {
	try {
		const bundle = await esbuildBuild({
			entryPoints: [path],
			outdir: ".",
			outfile: "",
			bundle: true,
			format: "esm",
			platform: "neutral",
			external: ["solid-js", "solid-js/web"],
			target: ["chrome99", "firefox99", "safari14"],
			absWorkingDir: Deno.cwd(),
			// minify: true,
			// minifyIdentifiers: false,
			// minifySyntax: true,
			// minifyWhitespace: true,
			write: false,
			plugins: [
				esbuildDenoPlugin({
					importMapURL,
				}),
				esbuildSolidPlugin({
					solid: {
						generate: "dom",
						hydratable: true,
					}
				}),
			]
		});

		const { outputFiles } = bundle;

		// This is the file that was requested by the browser
		// and it's the one we want to return.
		
		const file = outputFiles.find((file) => {
			const ext = extname(file.path);
			return ext === ".js" || ext === ".jsx" || ext === ".ts" || ext === ".tsx";
		});

		return file?.text;
	} catch {
		return "There was an error bundling the file.";
	}
}
