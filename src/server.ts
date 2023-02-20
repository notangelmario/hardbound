import { bundle } from "./bundle.ts";
import { fromFileUrl, join, OakApplication, Router } from "./deps.ts"
import { watcher } from "./watcher.ts";

interface Options {
	port?: number,
	importMetaUrl: string,
	importMapPath?: string,
}

export async function serve(options: Options) {
	const app = new OakApplication();
	const router = new Router();
	watcher(router, options.importMetaUrl);

	app.addEventListener("listen", ({ hostname, port, secure }) => {
		console.log(`Listening on: ${secure ? "https://" : "http://"}${hostname ?? "localhost"}:${port}`);
	});

	router.get("/_hb/import_map.json", async (ctx) => {
		const { response } = ctx;

		const importMap = await Deno.readTextFile(new URL(options.importMapPath ?? "/import_map.json", options.importMetaUrl));

		response.body = importMap;
		response.headers.set("Content-Type", "application/json");
		return;
	});

	router.get("/_hb_dev/refresh.js", async (ctx) => {
		const { response } = ctx;

		response.body = await Deno.readTextFile(new URL("refresh.js", import.meta.url));
		response.headers.set("Content-Type", "application/javascript");
		return;
	});

	router.get("/_hb/:path*", async (ctx) => {
		const { request, response } = ctx;
		const { url } = request;

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
		response.headers.set("Content-Type", "application/javascript");
		return;
	});

	app.use(async (ctx, next) => {
		const { request, response } = ctx;

		await next();

		if (request.accepts()?.includes("text/html")) {
			response.body = await Deno.readTextFile(new URL("index.html", options.importMetaUrl));
			response.headers.set("Content-Type", "text/html");
			return;
		}
	});

	app.use(router.routes());
	app.use(router.allowedMethods());

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
