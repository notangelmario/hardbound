/** @jsx h */
import h from "solid-js/h";
import { JSX } from "solid-js";
import tw from "../lib/twind.ts";

export default function Card({ children }: { children: JSX.Element }) {
	return (
		<div class={tw("flex flex-col gap-2 bg-gray-100 p-4 rounded-md")}>
			{children}
		</div>
	);
}
