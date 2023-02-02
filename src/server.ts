import { bundle } from "./bundle.ts";
import { fromFileUrl, join, OakApplication } from "./deps.ts"

interface Options {
	port?: number,
	importMetaUrl: string,
	importMapPath?: string,
}

export async function serve(options: Options) {
	const app = new OakApplication();

	app.addEventListener("listen", ({ hostname, port, secure }) => {
		console.log(`Listening on: ${secure ? "https://" : "http://"}${hostname ?? "localhost"}:${port}`);
	});

	app.use(async (ctx) => {
		const { request, response } = ctx;
		const { url } = request;

		if (url.pathname.startsWith("/_hb/import_map.json")) {
			const importMap = await Deno.readTextFile(new URL(options.importMapPath ?? "/import_map.json", options.importMetaUrl));

			response.body = importMap;
			response.headers.set("Content-Type", "application/json");
			return;
		}

		if (url.pathname.startsWith("/_hb/")) {
			const path = convertReqUrlToFilePath(url.href, options.importMetaUrl);

			if (!path) {
				response.status = 404;
				response.body = "File not found";
				return;
			}

			try {
				await Deno.stat(path);
			} catch {
				response.status = 404;
				response.body = "File not found";
				return;
			}

			const code = await bundle(path, new URL("/_hb/import_map.json", url.origin));
			response.body = code;
		}

		if (request.accepts()?.includes("text/html")) {
			response.body = await Deno.readTextFile(new URL("index.html", options.importMetaUrl));
		}
	});

	await app.listen({ port: options.port ?? 3000 });
}

const convertReqUrlToFilePath = (reqUrl: string, importMetaUrl: string): string | null => {
	try {
		const basePathname = fromFileUrl(importMetaUrl.substring(0, importMetaUrl.lastIndexOf("/")));
		const urlPath = new URL(reqUrl.replace("/_hb/", "/src/")).pathname;
		const path = join(basePathname, urlPath);

		return path;
	} catch (e) {
		console.error(e);
		return null;
	}
}
