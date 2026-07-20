import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "scripts",
    emptyOutDir: false,
    lib: { entry: "scripts/main.ts", formats: ["es"], fileName: () => "main.js" },
    rollupOptions: { output: { inlineDynamicImports: true } }
  }
});
