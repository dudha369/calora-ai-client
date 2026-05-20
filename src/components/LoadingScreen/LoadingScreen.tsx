import { Sprout } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Sprout className="size-24 text-zinc-400 animate-pulse" />
    </div>
  );
};