import Button from "./components/Button.tsx";
import Card from "./components/Card.tsx";
import CodeBlock from "./components/CodeBlock.tsx";
import tw from "./lib/twind.ts";

export default function App() {
	return (
		<main
			class={tw("flex flex-col py-2 gap-2 max-w-3xl mx-auto")}
		>
			<div
				class={tw("flex flex-col h-[75vh] justify-center gap-2")}
			>
				<h1 class={tw("text-5xl font-bold text-center")}>Welcome to Hardbound!</h1>
				<p class={tw("text-2xl text-center")}>
					The Deno way of making a SolidJS app.
				</p>
			</div>

			
			<Card>
				<h2 class={tw("text-3xl font-bold")}>What is Hardbound?</h2>
				<p>
					Hardbound is a SolidJS framework that uses Deno to make 
					your apps better, faster, and stronger.
				</p>

				<p>
					Here is what you get:
				</p>
				<ul class={tw("list-disc list-inside")}>
					<li>Hot Reloading</li>
					<li>Automatic TypeScript Support</li>
					<li>No compilation</li>
					<li>Just-in-time compilation</li>
					<li>Optional SSG*</li>
					<li>Optional SSR*</li>
				</ul>

				<p class={tw("text-sm text-gray-500")}>
					*SSG and SSR are not yet implemented.
				</p>
			</Card>
		
	
			<Card>
				<h2 class={tw("text-3xl font-bold")}>Getting Started</h2>
				
				<p>
					If you don't want TypeScript, you can use the following command:
				</p>
				<CodeBlock>
					deno run -A https://deno.land/x/hardbound/init.ts my-app
				</CodeBlock>

				<p>
					Otherwise, you can use the following command:
				</p>
				<CodeBlock>
					deno run -A https://deno.land/x/hardbound/init.ts -t my-app
				</CodeBlock>
			</Card>

			<Card>
				<h2 class={tw("text-3xl font-bold")}>Contributing</h2>
				
				<p>
					If you want to contribute to Hardbound, you can do so by
					forking the repository and making a pull request.
				</p>

				<a 
					class={tw("text-lg font-bold")}
					href="https://github.com/notangelmario/hardbound"
				>
					<Button>
						<img
							src="https://simpleicons.org/icons/github.svg"
							alt="Github"
							class={tw("h-6 w-6 inline-block mr-2 invert")}
						/>
						GitHub
					</Button>
				</a>
			</Card>
					
		</main>
	);
}
