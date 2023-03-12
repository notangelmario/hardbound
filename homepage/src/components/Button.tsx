import { JSX } from "solid-js";
import tw from "../lib/twind.ts";

export default function Button({ children, onClick }: { children: JSX.Element, onClick?: () => void }) {
	return (
		<button
			class={tw("bg-blue-600 text-white rounded-md p-2 flex items-center justify-center w-full")}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
