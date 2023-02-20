import { version } from "./common.ts";

export const mainTs = `
import { serve } from "hardbound";

await serve({
	port: 3000,
	importMetaUrl: import.meta.url,
	importMapPath: "./import_map.json",
});
`;

export const indexHtml = `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Example Hardbound app</title>
	</head>
	<body>
		<div id="root"></div>
		<!-- hb_dev -->
		<script src="/_hb/index.tsx" type="module"></script>
	</body>
</html>
`;

export const importMap = `
{
	"imports": {
		"hardbound": "https://deno.land/x/hardbound@${version}/mod.ts",
		"solid-js": "https://esm.sh/solid-js@1.6.9?target=esnext&dev",
		"solid-js/web": "https://esm.sh/solid-js@1.6.9/web?target=esnext&dev",
		"solid-js/jsx-runtime": "https://esm.sh/solid-js@1.6.9/jsx-runtime?target=esnext&dev"
	}
}
`;

export const indexTsx = `
import { render } from "solid-js/web";
import App from "./App.tsx";

render(() => <App />, document.getElementById("root")!);
`;

export const appTsx = `
export default function App() {
	return (
		<div>
			<h1>Hello, world!</h1>
		</div>
	);
}
`;

export const bootstrap = (projectPath: string) => {
	Deno.mkdirSync(`${projectPath}/src`, { recursive: true });
	
	Deno.writeTextFileSync(`${projectPath}/main.ts`, mainTs);
	Deno.writeTextFileSync(`${projectPath}/index.html`, indexHtml);
	Deno.writeTextFileSync(`${projectPath}/import_map.json`, importMap);
	Deno.writeTextFileSync(`${projectPath}/src/index.tsx`, indexTsx);
	Deno.writeTextFileSync(`${projectPath}/src/App.tsx`, appTsx);
}
