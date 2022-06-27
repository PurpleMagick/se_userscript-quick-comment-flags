import { FlagOptions, FlagType } from "@types";

function makeFlag({ text, tooltip, flagId }: FlagOptions) {
	const link = document.createElement("a");

	link.href = "#";
	link.textContent = `(${text})`;
	link.title = tooltip;
	link.dataset.quickFlag = String(flagId);

	return link;
}

export const flags = {
	get Rude() {
		return makeFlag({ text: "Rude", tooltip: "Rude or offensive", flagId: FlagType.RudeOrOffensive });
	},
	get Unfriendly() {
		return makeFlag({ text: "U/U", tooltip: "Unfriendly or unkind", flagId: FlagType.UnfriendlyOrUnkind });
	},
	get NLN() {
		return makeFlag({ text: "NLN", tooltip: "No Longer Needed", flagId: FlagType.NoLongerNeeded });
	},
};
