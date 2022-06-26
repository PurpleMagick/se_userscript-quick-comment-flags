import { FlagOptions, FlagType } from "@types";

function makeFlag({ text, tooltip, flagId }: FlagOptions) {
	const link = document.createElement("a");

	link.href = "#";
	link.textContent = `(${text})`;
	link.title = tooltip;
	link.dataset.quickFlag = String(flagId);

	return link;
}
const flags = {
	get NLN() {
		return makeFlag({ text: "NLN", tooltip: "No Longer Needed", flagId: FlagType.NoLongerNeeded });
	}
};
function addQuickFlags(comment: Element) {
	const quickFlags = document.createElement("span");
	quickFlags.classList.add("quick-commend-flag-links");
	quickFlags.append(flags.NLN);

	comment.classList.add("quick-comment-flags");
	comment.querySelector(".comment-date")
		?.parentElement
		?.append(quickFlags);
}
export function main() {
	const allComments = document.querySelectorAll("li.comment:not(.quick-comment-flags)");

	for (const comment of allComments)
		addQuickFlags(comment);
}
