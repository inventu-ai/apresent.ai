import { create } from "zustand";
import { type Themes, type ThemeProperties } from "@/lib/presentation/themes";
import { type ImageModelList } from "@/app/_actions/image/generate";
import { type PlateSlide } from "@/components/presentation/utils/parser";

interface PresentationState {
  currentPresentationId: string | null;
  currentPresentationTitle: string | null;
  isGridView: boolean;
  isSheetOpen: boolean;
  numSlides: number;
  isNumSlidesManuallySet: boolean; // Flag to track if user manually changed slide count
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  theme: Themes | string;
  customThemeData: ThemeProperties | null;
  language: string;
  isLanguageManuallySet: boolean; // Flag to track if user manually changed language
  pageStyle: string;
  showTemplates: boolean;
  presentationInput: string;
  originalPrompt: string; // Store the original full prompt
  imageModel: ImageModelList;
  presentationStyle: string;
  savingStatus: "idle" | "saving" | "saved";
  isPresenting: boolean;
  currentSlideIndex: number;
  isThemeCreatorOpen: boolean;
  imageGenerationModelOpen: boolean;

  // Generation states
  shouldStartOutlineGeneration: boolean;
  shouldStartPresentationGeneration: boolean;
  isGeneratingOutline: boolean;
  isGeneratingPresentation: boolean;
  isRegeneratingSlide: boolean;
  regeneratingSlideIndex: number | null;
  shouldStartSlideRegeneration: boolean;
  outline: string[];
  slides: PlateSlide[]; // This now holds the new object structure

  setSlides: (slides: PlateSlide[]) => void;
  setCurrentPresentation: (id: string | null, title: string | null) => void;
  setIsGridView: (isGrid: boolean) => void;
  setIsSheetOpen: (isOpen: boolean) => void;
  setNumSlides: (num: number, isManual?: boolean) => void;
  setTheme: (
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    theme: Themes | string,
    customData?: ThemeProperties | null
  ) => void;
  shouldShowExitHeader: boolean;
  setShouldShowExitHeader: (udpdate: boolean) => void;
  setLanguage: (lang: string, isManual?: boolean) => void;
  setPageStyle: (style: string) => void;
  setShowTemplates: (show: boolean) => void;
  setPresentationInput: (input: string) => void;
  setOriginalPrompt: (prompt: string) => void;
  setOutline: (topics: string[]) => void;
  setImageModel: (model: ImageModelList) => void;
  setPresentationStyle: (style: string) => void;
  setSavingStatus: (status: "idle" | "saving" | "saved") => void;
  setIsPresenting: (isPresenting: boolean) => void;
  setCurrentSlideIndex: (index: number) => void;
  nextSlide: () => void;
  previousSlide: () => void;

  setIsThemeCreatorOpen: (update: boolean) => void;
  setImageGenerationModelOpen: (open: boolean) => void;
  // Generation actions
  setShouldStartOutlineGeneration: (shouldStart: boolean) => void;
  setShouldStartPresentationGeneration: (shouldStart: boolean) => void;
  setIsGeneratingOutline: (isGenerating: boolean) => void;
  setIsGeneratingPresentation: (isGenerating: boolean) => void;
  startOutlineGeneration: () => void;
  startPresentationGeneration: () => void;
  resetGeneration: () => void;
  
  // Slide regeneration actions
  setIsRegeneratingSlide: (isRegenerating: boolean) => void;
  setRegeneratingSlideIndex: (index: number | null) => void;
  setShouldStartSlideRegeneration: (shouldStart: boolean) => void;
  startSlideRegeneration: (slideIndex: number) => void;

  // Selection state
  isSelecting: boolean;
  selectedPresentations: string[];
  toggleSelecting: () => void;
  selectAllPresentations: (ids: string[]) => void;
  deselectAllPresentations: () => void;
  togglePresentationSelection: (id: string) => void;
}

export const usePresentationState = create<PresentationState>((set) => ({
  currentPresentationId: null,
  currentPresentationTitle: null,
  isGridView: true,
  isSheetOpen: false,
  shouldShowExitHeader: false,
  setShouldShowExitHeader: (update) => set({ shouldShowExitHeader: update }),
  numSlides: 10,
  isNumSlidesManuallySet: false,
  language: "en-US",
  isLanguageManuallySet: false,
  pageStyle: "default",
  showTemplates: false,
  presentationInput: "",
  originalPrompt: "",
  outline: [],
  theme: "mystique",
  customThemeData: null,
  imageModel: "flux-dev",
  presentationStyle: "professional",
  slides: [], // Now holds the new slide object structure
  savingStatus: "idle",
  isPresenting: false,
  currentSlideIndex: 0,
  isThemeCreatorOpen: false,
  imageGenerationModelOpen: false,

  // Generation states
  shouldStartOutlineGeneration: false,
  shouldStartPresentationGeneration: false,
  isGeneratingOutline: false,
  isGeneratingPresentation: false,
  isRegeneratingSlide: false,
  regeneratingSlideIndex: null,
  shouldStartSlideRegeneration: false,

  setSlides: (slides) => {
    set({ slides });
  },
  setCurrentPresentation: (id, title) =>
    set({ currentPresentationId: id, currentPresentationTitle: title }),
  setIsGridView: (isGrid) => set({ isGridView: isGrid }),
  setIsSheetOpen: (isOpen) => set({ isSheetOpen: isOpen }),
  setNumSlides: (num, isManual = false) => {
    set({ 
      numSlides: num, 
      isNumSlidesManuallySet: isManual 
    });
  },
  setLanguage: (lang, isManual = false) => set({ 
    language: lang, 
    isLanguageManuallySet: isManual 
  }),
  setTheme: (theme, customData = null) =>
    set({
      theme: theme,
      customThemeData: customData,
    }),
  setPageStyle: (style) => set({ pageStyle: style }),
  setShowTemplates: (show) => set({ showTemplates: show }),
  setPresentationInput: (input) => set({ presentationInput: input }),
  setOriginalPrompt: (prompt) => set({ originalPrompt: prompt }),
  setOutline: (topics) => set({ outline: topics }),
  setImageModel: (model) => set({ imageModel: model }),
  setPresentationStyle: (style) => set({ presentationStyle: style }),
  setSavingStatus: (status) => set({ savingStatus: status }),
  setIsPresenting: (isPresenting) => set({ isPresenting }),
  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
  nextSlide: () =>
    set((state) => ({
      currentSlideIndex: Math.min(
        state.currentSlideIndex + 1,
        state.slides.length - 1
      ),
    })),
  previousSlide: () =>
    set((state) => ({
      currentSlideIndex: Math.max(state.currentSlideIndex - 1, 0),
    })),

  // Generation actions
  setShouldStartOutlineGeneration: (shouldStart) =>
    set({ shouldStartOutlineGeneration: shouldStart }),
  setShouldStartPresentationGeneration: (shouldStart) =>
    set({ shouldStartPresentationGeneration: shouldStart }),
  setIsGeneratingOutline: (isGenerating) =>
    set({ isGeneratingOutline: isGenerating }),
  setIsGeneratingPresentation: (isGenerating) =>
    set({ isGeneratingPresentation: isGenerating }),
  startOutlineGeneration: () =>
    set({
      shouldStartOutlineGeneration: true,
      isGeneratingOutline: true,
      shouldStartPresentationGeneration: false,
      isGeneratingPresentation: false,
      outline: [],
    }),
  startPresentationGeneration: () =>
    set({
      shouldStartPresentationGeneration: true,
      isGeneratingPresentation: true,
    }),
  resetGeneration: () =>
    set({
      shouldStartOutlineGeneration: false,
      shouldStartPresentationGeneration: false,
      isGeneratingOutline: false,
      isGeneratingPresentation: false,
      isRegeneratingSlide: false,
      regeneratingSlideIndex: null,
      shouldStartSlideRegeneration: false,
    }),
    
  // Slide regeneration actions
  setIsRegeneratingSlide: (isRegenerating) => 
    set({ isRegeneratingSlide: isRegenerating }),
  setRegeneratingSlideIndex: (index) => 
    set({ regeneratingSlideIndex: index }),
  setShouldStartSlideRegeneration: (shouldStart) => 
    set({ shouldStartSlideRegeneration: shouldStart }),
  startSlideRegeneration: (slideIndex) => 
    set({
      shouldStartSlideRegeneration: true,
      isRegeneratingSlide: true,
      regeneratingSlideIndex: slideIndex,
    }),

  setIsThemeCreatorOpen: (update) => set({ isThemeCreatorOpen: update }),
  setImageGenerationModelOpen: (open) => set({ imageGenerationModelOpen: open }),
  // Selection state
  isSelecting: false,
  selectedPresentations: [],
  toggleSelecting: () =>
    set((state) => ({
      isSelecting: !state.isSelecting,
      selectedPresentations: [],
    })),
  selectAllPresentations: (ids) => set({ selectedPresentations: ids }),
  deselectAllPresentations: () => set({ selectedPresentations: [] }),
  togglePresentationSelection: (id) =>
    set((state) => ({
      selectedPresentations: state.selectedPresentations.includes(id)
        ? state.selectedPresentations.filter((p) => p !== id)
        : [...state.selectedPresentations, id],
    })),
}));
