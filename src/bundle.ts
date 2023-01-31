import { Loader } from "https://deno.land/x/esbuild@v0.17.5/mod.js";
import { 
	esbuildInit, 
	esbuildBuild, 
	fromFileUrl,
	extname,
	join,
} from "./deps.ts";


await esbuildInit({});


// This function gets the URL requested by the browser
// and returns the bundled code which is mapped one to one
// with the src folder.
export async function bundle(url: string, importMetaUrl: string) {
	const basePathname = fromFileUrl(importMetaUrl.substring(0, importMetaUrl.lastIndexOf("/")));
	const urlPath = new URL(url.replace("/_hb/", "/src/")).pathname;
	const path = join(basePathname, urlPath);

	const bundle = await esbuildBuild({
		entryPoints: [path],
		outdir: ".",
		bundle: true,
		format: "esm",
		platform: "neutral",
		// At this point ext can either be .js, .jsx, .ts or .tsx
		jsxFactory: "h",
		minify: true,
		write: false,
		jsxImportSource: "solid-js",
	});

	const { outputFiles } = bundle;

	// This is the file that was requested by the browser
	// and it's the one we want to return.
	
	const file = outputFiles.find((file) => {
		const ext = extname(file.path);
		return ext === ".js" || ext === ".jsx" || ext === ".ts" || ext === ".tsx";
	});

	return file?.text;
}
