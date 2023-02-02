import { 
	esbuildInit, 
	esbuildBuild, 
	extname,
	esbuildDenoPlugin,
	esbuildSolidPlugin,
	solidRefreshPlugin,
} from "./deps.ts";


await esbuildInit({});


// This function gets the URL requested by the browser
// and returns the bundled code which is mapped one to one
// with the src folder.
export async function bundle(path: string, importMapURL: URL) {
	try {
		const bundle = await esbuildBuild({
			entryPoints: [path],
			outdir: ".",
			bundle: true,
			format: "esm",
			platform: "neutral",
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
						generate: "universal",
						hydratable: false,
						moduleName: "solid-js/web",
					},
					babel: {
						plugins: [[solidRefreshPlugin, { bundler: "vite" }]]
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
