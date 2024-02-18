import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import { terser } from 'rollup-plugin-terser';
import { Plugin } from 'vite';

export default defineConfig({
  plugins: [
    externalizeDeps(),
    dts({
      outDir: `dist/esm`,
      insertTypesEntry: true,
      entryRoot: './src',
      include: './src',
      compilerOptions: {
        // @ts-expect-error
        module: 'esnext',
        declarationMap: false,
      },
    }),
    dts({
      outDir: `dist/cjs`,
      insertTypesEntry: true,
      entryRoot: './src',
      include: './src',
      compilerOptions: {
        // @ts-expect-error
        module: 'commonjs',
        declarationMap: false,
      },
    }),
    terser({
      format: {
        comments: false,
      },
    }) as Plugin,
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      // name: 'WhisperECS',
      fileName: (format) => {
        if (format === 'cjs') return 'cjs/[name].cjs';
        return 'esm/[name].js';
      },
    },
    rollupOptions: {
      output: {
        preserveModules: true,
      },
    },
    sourcemap: true,
  },
});
