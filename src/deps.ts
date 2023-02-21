// oak
export { 
	Application as OakApplication,
	Router
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

// std
export {
  basename,
  dirname,
  extname,
  fromFileUrl,
  join,
  relative,
  resolve,
  toFileUrl,
} from "https://deno.land/std@0.175.0/path/mod.ts";

export {
	parse as parseFlags
} from "https://deno.land/std@0.175.0/flags/mod.ts";

// esbuild
// @deno-types="https://deno.land/x/esbuild@v0.14.51/mod.d.ts"
import * as esbuildWasm from "https://deno.land/x/esbuild@v0.14.51/wasm.js";
import * as esbuildNative from "https://deno.land/x/esbuild@v0.14.51/mod.js";

const esbuild: typeof esbuildWasm = Deno.run === undefined
  ? esbuildWasm
  : esbuildNative;

export const { 
	initialize: esbuildInit,
	build: esbuildBuild,
	stop: esbuildStop,
} = esbuild;

export {
	denoPlugin as esbuildDenoPlugin,
} from "https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts";

export {
	solidPlugin as esbuildSolidPlugin,
} from "https://esm.sh/esbuild-plugin-solid@0.5.0?external=esbuild";
