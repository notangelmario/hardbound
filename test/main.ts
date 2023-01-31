import { bundle } from "../src/bundle.ts";
import { esbuildStop } from "../src/deps.ts";

const result = await bundle("http://localhost:3000/_hb/App.tsx", import.meta.url);
esbuildStop();

console.log(result);
