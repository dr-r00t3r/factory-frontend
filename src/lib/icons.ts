// Compatibility shim: some icon names used in this project are not exported
// by the installed lucide-react version. Re-export everything and alias the
// missing names so the rest of the codebase keeps working unchanged.
export {
  Wheat as Rice,
  Coins as HandCoins,
} from "lucide-react";

export * from "lucide-react";
