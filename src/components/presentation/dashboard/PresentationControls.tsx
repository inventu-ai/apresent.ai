import { Layout } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePresentationState } from "@/states/presentation-state";
import { useUserPlanLimits } from "@/hooks/useUserCredits";

export function PresentationControls({
  shouldShowLabel = true,
}: {
  shouldShowLabel?: boolean;
}) {
  const {
    numSlides,
    setNumSlides,
    language,
    setLanguage,
    pageStyle,
    setPageStyle,
  } = usePresentationState();
  

  

  
  const { maxCards, planName } = useUserPlanLimits();
  
  const SLIDE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30];
  
  const getPlanForSlides = (slideCount: number) => {
    if (slideCount <= 10) return 'FREE';
    if (slideCount <= 20) return 'PRO';
    return 'PREMIUM';
  };
  
  const getPlanBadge = (slideCount: number) => {
    const requiredPlan = getPlanForSlides(slideCount);
    
    if (requiredPlan === 'FREE') return null;
    
    if (requiredPlan === 'PRO') {
      return (
        <Badge className="ml-auto text-xs bg-blue-600 text-white hover:bg-blue-700">
          PRO
        </Badge>
      );
    }
    
    return (
      <Badge className="ml-auto text-xs bg-purple-600 text-white hover:bg-purple-700">
        PREMIUM
      </Badge>
    );
  };
  
  const isSlideCountAllowed = (slideCount: number) => {
    return slideCount <= maxCards;
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Number of Slides */}
      <div>
        {shouldShowLabel && (
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Number of slides
          </label>
        )}
        <Select
          value={String(numSlides)}
          onValueChange={(v) => {
    
            setNumSlides(Number(v), true); // Mark as manual change
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select number of slides" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {SLIDE_OPTIONS.map((num) => {
              const isAllowed = isSlideCountAllowed(num);
              
              return (
                <SelectItem 
                  key={num} 
                  value={String(num)}
                  disabled={!isAllowed}
                  className={`flex items-center justify-between py-3 px-3 ${
                    !isAllowed ? 'bg-gray-50/50 shadow-inner' : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={!isAllowed ? 'text-gray-300' : 'text-white'}>
                      {num} {num === 1 ? 'slide' : 'slides'}
                    </span>
                    <div className="ml-8">
                      {getPlanBadge(num)}
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Language */}
      <div>
        {shouldShowLabel && (
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Language
          </label>
        )}
        <Select key={language} value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US">English (US)</SelectItem>
            <SelectItem value="pt">Portuguese</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
            <SelectItem value="it">Italian</SelectItem>
            <SelectItem value="ja">Japanese</SelectItem>
            <SelectItem value="ko">Korean</SelectItem>
            <SelectItem value="zh">Chinese</SelectItem>
            <SelectItem value="ru">Russian</SelectItem>
            <SelectItem value="hi">Hindi</SelectItem>
            <SelectItem value="ar">Arabic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Page Style */}
      <div>
        {shouldShowLabel && (
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Page style
          </label>
        )}
        <Select value={pageStyle} onValueChange={setPageStyle}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <SelectValue placeholder="Select page style" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">
              <div className="flex items-center gap-3">
                <span>Default</span>
              </div>
            </SelectItem>
            <SelectItem value="traditional">
              <div className="flex items-center gap-3">
                <span>Traditional</span>
              </div>
            </SelectItem>
            <SelectItem value="tall">
              <div className="flex items-center gap-3">
                <span>Tall</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
