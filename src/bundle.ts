import { 
	esbuildInit, 
	esbuildBuild, 
	extname,
	esbuildDenoPlugin,
	esbuildSolidPlugin,
	fromFileUrl,
} from "./deps.ts";


// Borrowed from fresh.
let esbuildInitialized: boolean | Promise<void> = false;
async function ensureEsbuildInitialized() {
  if (esbuildInitialized === false) {
	esbuildInit({});
    esbuildInitialized = true;
  } else if (esbuildInitialized instanceof Promise) {
    await esbuildInitialized;
  }
}


// This function gets the URL requested by the browser
// and returns the bundled code which is mapped one to one
// with the src folder.
export async function bundle(path: string, importMapURL: URL) {
	const absWorkingDir = Deno.cwd();
	await ensureEsbuildInitialized();

	try {
		const bundle = await esbuildBuild({
			entryPoints: [path],
			outdir: ".",
			outfile: "",
			bundle: true,
			format: "esm",
			platform: "neutral",
			target: ["chrome99", "firefox99", "safari14"],
			absWorkingDir,
			// minify: true,
			// minifyIdentifiers: false,
			// minifySyntax: true,
			// minifyWhitespace: true,
			treeShaking: true,
			write: false,
			jsx: "transform",
			plugins: [
				esbuildDenoPlugin({
					importMapURL,
				}),
				esbuildSolidPlugin({
					solid: {
						generate: "dom",
						hydratable: false,
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
