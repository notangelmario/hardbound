import { bundle } from "./bundle.ts";
import { copy, esbuildStop, join } from "./deps.ts";
import type { Options } from "./server.ts";
import { DEPLOY_ID } from "./server.ts";

export async function build(options: Options) {
	if (!options.outputDir) {
		console.error("outputDir is required");
		return;
	}

	const absoluteOutputDir = new URL(options.outputDir, options.importMetaUrl);
	Deno.mkdirSync(absoluteOutputDir, { recursive: true });

	// Build index.html
	let html = await Deno.readTextFile(new URL("index.html", options.importMetaUrl));
	html = html.replace("<!-- hb_dev -->", "");
	html = html.replace("index.tsx", "index.js");
	html = html.replace("DEPLOY_ID", DEPLOY_ID);
	await Deno.writeTextFile(join(absoluteOutputDir.pathname, "index.html"), html);
	

	// Copy public files to outputDir in /_public
	const publicDir = new URL("public", options.importMetaUrl);
	if (await Deno.stat(publicDir).catch(() => false)) {
		await copy(publicDir, new URL("_public", absoluteOutputDir), { overwrite: true });
	}

	// Bundle index.tsx
	const indexPath = new URL("src/index.tsx", options.importMetaUrl);

	try {
		await Deno.stat(indexPath);
	} catch {
		console.error("index.tsx not found");
		return;
	}

	const code = await bundle(indexPath.pathname, new URL(options.importMapPath ?? "/import_map.json", options.importMetaUrl));

	if (!code) {
		console.error("Failed to bundle index.tsx");
		esbuildStop();
		return;
	}

	await Deno.mkdir(join(absoluteOutputDir.pathname, "_hb"), { recursive: true });
	await Deno.writeTextFile(join(absoluteOutputDir.pathname, "_hb/index.js"), code, { create: true });

	esbuildStop();

	return;
}
