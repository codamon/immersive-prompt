/// <reference types="vite/client" />

// This allows TypeScript to understand that window.chrome might exist,
// especially for your mock environment.
declare global {
    interface Window {
      chrome?: { // Make chrome optional on the window for type safety
        storage?: {
          local?: {
            get: (keys: any, callback: (items: Record<string, any>) => void) => void;
            set: (items: Record<string, any>, callback?: () => void) => void;
            // You can add other methods like remove, clear if your mock implements them
          };
          // You can add other storage areas like sync, managed if needed
        };
        // You can add other chrome APIs if your mock covers them
      };
    }
  }
  
  // Add this export {} to make it a module, which is often good practice for .d.ts files.
  // If vite-env.d.ts already has content, just add the declare global block.
  export {};