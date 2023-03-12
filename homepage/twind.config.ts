import { defineConfig } from "@twind/core";
import presetTailwind from "@twind/preset-tailwind";

export default defineConfig({
	darkMode: "media",
	presets: [presetTailwind()],
	theme: {
		extend: {
			colors: {
				dark: "#212121",
			}
		}
	}
});
