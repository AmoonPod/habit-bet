"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface SelectedPlanContextType {
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  clearSelectedPlan: () => void;
  isReady: boolean;
}

const SelectedPlanContext = createContext<SelectedPlanContextType>({
  selectedProductId: null,
  setSelectedProductId: () => {},
  clearSelectedPlan: () => {},
  isReady: false,
});

const STORAGE_KEY = "habitbet_selected_plan";

export const SelectedPlanProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProductId, setSelectedProductIdState] = useState<
    string | null
  >(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize from localStorage when component mounts (client-side only)
  useEffect(() => {
    try {
      const storedPlan = localStorage.getItem(STORAGE_KEY);
      if (storedPlan) {
        setSelectedProductIdState(storedPlan);
      }
    } catch (e) {
      // Ignore localStorage errors (e.g. in incognito mode)
    }
    // Mark as ready after initializing from localStorage
    setIsReady(true);
  }, []);

  const setSelectedProductId = (id: string | null) => {
    setSelectedProductIdState(id);

    // Only attempt to use localStorage if we're in the browser
    if (typeof window !== "undefined") {
      try {
        if (id) {
          localStorage.setItem(STORAGE_KEY, id);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  };

  const clearSelectedPlan = () => {
    setSelectedProductId(null);
  };

  return (
    <SelectedPlanContext.Provider
      value={{
        selectedProductId,
        setSelectedProductId,
        clearSelectedPlan,
        isReady,
      }}
    >
      {children}
    </SelectedPlanContext.Provider>
  );
};

export const useSelectedPlan = () => {
  const context = useContext(SelectedPlanContext);
  return context;
};
