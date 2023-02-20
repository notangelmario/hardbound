import { parseFlags } from "./src/deps.ts";
import { version } from "./src/init/common.ts";

const help = `
hardbound@${version}

Usage:
	deno run -A ${import.meta.url.replace("file://", "")} [options] <project_name>

Options:
	--typescript, -t  Initialize project with TypeScript support

Examples:
	hardbound init my_project
	hardbound init -t my_project
`;


if (Deno.args.length === 0) {
	console.log(help);
	Deno.exit(1);
}

console.log("%c👋 Hello! Setting up your Hardbound project...", "color: #00b3b3; font-size: 1.5rem;");
console.log("%c🔧 This may take a few minutes...", "color: #00b3b3; font-size: 1.5rem;");

const flags = parseFlags(Deno.args, {
	alias: {
		typescript: "t",
	},
	boolean: ["typescript"],
	default: {
		typescript: false,
	},
});

const projectName = Deno.args.find((arg) => !arg.startsWith("-"));

if (!projectName || typeof projectName !== "string") {
	console.log(help);
	Deno.exit(1);
}

const projectPath = `${Deno.cwd()}/${projectName}`;

const projectExists = await Deno.stat(projectPath).catch(() => false);

if (projectExists) {
	console.log(`%c❌ Project ${projectName} already exists.`, "color: #ff0000; font-size: 1.5rem;");
	Deno.exit(1);
}

try {
	if (!flags.typescript) {
		console.log("%c🔧 Initializing project with JavaScript support...", "color: #00b3b3; font-size: 1.5rem;");
		const { bootstrap } = await import("./src/init/javascript.ts");
		bootstrap(projectPath);
	} else {
		console.log("%c🔧 Initializing project with TypeScript support...", "color: #00b3b3; font-size: 1.5rem;");
		const { bootstrap } = await import("./src/init/typescript.ts");
		bootstrap(projectPath);
	}
} catch (error) {
	console.log(error);
	Deno.exit(1);
}

console.log("%c🎉 Your project is ready!", "color: #00b3b3; font-size: 1.5rem;");
