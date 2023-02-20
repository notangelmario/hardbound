import { fromFileUrl, Router } from "./deps.ts";

export const watcher = (router: Router, path: string) => {
	const sockets = new Set<WebSocket>();
	watchFiles(sockets, path);

	router.get("/_hb_dev/refresh.js", async (ctx) => {
		const { response } = ctx;

		response.body = await Deno.readTextFile(new URL("refresh.js", import.meta.url));
		response.headers.set("Content-Type", "application/javascript");
		return;
	});

	router.get("/_hb_dev/refresh", (ctx) => {
		const ws = ctx.upgrade();

		sockets.add(ws);

		ws.addEventListener("close", () => {
			sockets.delete(ws);
		});

		return;
	});
}

const watchFiles = async (sockets: Set<WebSocket>, path: string) => {
	const basePathname = fromFileUrl(path.substring(0, path.lastIndexOf("/")));
	const watcher = Deno.watchFs(basePathname);

	for await (const event of watcher) {
		if (["any", "access"].includes(event.kind)) {
			continue
		}

		sockets.forEach((socket) => {
			socket.send("refresh");
		});
	}
}
