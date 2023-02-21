import { serve } from "hardbound";


await serve({
	port: 3000,
	importMetaUrl: import.meta.url,
	importMapPath: "./import_map.json",
});
