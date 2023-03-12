import { bundle } from "./bundle.ts";
import { fromFileUrl, join, OakApplication, Router } from "./deps.ts"
import { watcher } from "./watcher.ts";

export const DEV_MODE = Deno.env.get("DEV") === "true";
export const DEPLOY_ID = Deno.env.get("DENO_DEPLOYMENT_ID") ?? Math.random().toString(36).substring(7);

export interface Options {
	port?: number,
	importMetaUrl: string,
	importMapPath?: string,
	outputDir?: string,
}

export async function serve(options: Options) {
	const app = new OakApplication();
	const cache = new Map<string, string>();
	const router = new Router();
	DEV_MODE && watcher(router, options.importMetaUrl);

	app.addEventListener("listen", ({ hostname, port, secure }) => {
		console.log(`Listening on: ${secure ? "https://" : "http://"}${hostname ?? "localhost"}:${port}`);
		DEV_MODE && console.log("DEV_MODE is enabled");
	});

	app.use(async (ctx, next) => {
		// Add cache control headers here
		// Cache for 1 year
		await next();

		const { request, response } = ctx;

		// Don't cache if in dev mode
		if (DEV_MODE) return; 

		if (request.url.pathname.startsWith("/_hb")) {
			response.headers.set("Cache-Control", "public, max-age=31536000");
		}
	});

	// Handle all requests to index.html
	app.use(async (ctx, next) => {
		const { request, response } = ctx;

		if (request.accepts()?.includes("text/html") && !request.url.pathname.startsWith("/_")) {
			let html = await Deno.readTextFile(new URL("index.html", options.importMetaUrl));

			if (DEV_MODE) {
				html = html.replace("<!-- hb_dev -->", "<script type=\"module\" src=\"/_hb_dev/refresh.js\"></script>");
			} else {
				html = html.replace("<!-- hb_dev -->", "");
			}

			html = html.replace("DEPLOY_ID", DEPLOY_ID);

			response.body = html;
			response.headers.set("Content-Type", "text/html");
			return;
		}

		await next();
	});

	// Bundle and serve all requests to /_hb
	router.get("/_hb/:path*", async (ctx) => {
		const { request, response } = ctx;
		const { url } = request;

		const path = convertReqUrlToFilePath(url.href, options.importMetaUrl);

		if (!path) {
			response.status = 404;
			response.body = "File not found";
			return;
		}

		if (!DEV_MODE && cache.has(url.pathname)) {
			response.body = cache.get(url.pathname);
			response.headers.set("Content-Type", "application/javascript");
			return;
		}

		try {
			await Deno.stat(path);
		} catch {
			response.status = 404;
			response.body = "File not found";
			return;
		}

		const code = await bundle(path, new URL(options.importMapPath ?? "/import_map.json", options.importMetaUrl));
		response.body = code;
		response.headers.set("Content-Type", "application/javascript");
		if (!DEV_MODE)
			cache.set(url.pathname, code);

		return;
	});

	// Serve all files in /public
	router.get("/_public/:path*", async (ctx) => {
		const { request, response } = ctx;
		const href = request.url.href.replace("/_public/", "/public/");
		const path = convertReqUrlToFilePath(href, options.importMetaUrl);

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

		await ctx.send({ 
			root: new URL("public", options.importMetaUrl).pathname,
			path: request.url.pathname.replace("/_public/", "/")
		});
	});


	app.use(router.routes());
	app.use(router.allowedMethods());

	await app.listen({ port: options.port ?? 3000 });
}

export const convertReqUrlToFilePath = (reqUrl: string, importMetaUrl: string): string | null => {
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
