import { 
	babelTransform,
	babelPresetSolid,
	solidRefreshPlugin
} from "./deps.ts";

// This function gets the URL requested by the browser
// and returns the bundled code which is mapped one to one
// with the src folder.
export async function bundle(path: string, file: string) {
	const content = await Deno.readTextFile(path);

	const { code } = babelTransform(content, {
		presets: [
			[babelPresetSolid, { generate: "dom", hydratable: false }],
			["typescript", { onlyRemoveTypeImports: true }],
		],
		plugins: [[solidRefreshPlugin, { bundler: "vite" }]],
		filename: file,
	});

	return code;
}
