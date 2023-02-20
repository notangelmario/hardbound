import { defineConfig } from "@twind/core";
import presetTailwind from "https://esm.sh/@twind/preset-tailwind@1.1.4";

export default defineConfig({
	darkMode: "media",
	presets: [presetTailwind()],
});
