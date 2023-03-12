import { JSX } from "solid-js";
import tw from "../lib/twind.ts";

export default function Card({ children }: { children: JSX.Element }) {
	return (
		<div class={tw("flex flex-col gap-2 bg-neutral-100 dark:(bg-neutral-800 text-white) p-4 rounded-md text-dark")}>
			{children}
		</div>
	);
}
