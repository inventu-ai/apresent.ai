import { PresentationControls } from "../dashboard/PresentationControls";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <div className={`flex items-center ${isMobile ? "justify-center" : ""} gap-4 justify-center xl:justify-start`}>
        <span className="text-sm text-foreground">Prompt</span>
        <PresentationControls shouldShowLabel={false} />
      </div>
    </div>
  );
}
