import { build } from "hardbound";

build({
	importMetaUrl: import.meta.url,
	outputDir: "dist",
	importMapPath: "../import_map.json",
});
