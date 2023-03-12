import tw from "../lib/twind.ts";

export default function CodeBlock({ children }: { children: string }) {
	return (
		<pre class={tw("bg-gray-700 p-4 rounded-md text-gray-100")}>
			<code>{children}</code>
		</pre>
	);
}
