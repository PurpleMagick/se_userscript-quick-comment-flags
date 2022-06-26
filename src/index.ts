import { attachListener } from "./attachListener";
import { main } from "./makeFlag";

$(document).ajaxComplete(main);
main();

attachListener();
