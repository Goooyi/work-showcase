// Build configuration and deployment detection
export const BUILD_ID =
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
  process.env.NEXT_PUBLIC_BUILD_ID ||
  Date.now().toString();

export const DATA_VERSION = "1.0.4";

// Storage keys
export const STORAGE_KEYS = {
  SECTIONS: "trialShowcaseSections",
  SIDEBAR: "sidebarCollapsed",
  VERSION: "trialShowcaseVersion",
  BUILD: "trialShowcaseBuildId",
} as const;

// Check if this is a new deployment
export const isNewDeployment = (): boolean => {
  if (typeof window === "undefined") return false;

  const savedBuildId = localStorage.getItem(STORAGE_KEYS.BUILD);
  return savedBuildId !== BUILD_ID;
};

// Clear all app data
export const clearAppData = (): void => {
  if (typeof window === "undefined") return;

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

// Initialize or migrate data
export const initializeAppData = (): boolean => {
  if (typeof window === "undefined") return false;

  const savedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
  const savedBuildId = localStorage.getItem(STORAGE_KEYS.BUILD);

  // Check if we need to clear data due to version or deployment change
  if (savedVersion !== DATA_VERSION || savedBuildId !== BUILD_ID) {
    clearAppData();
    localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
    localStorage.setItem(STORAGE_KEYS.BUILD, BUILD_ID);
    return true; // Data was cleared
  }

  return false; // Data was kept
};
