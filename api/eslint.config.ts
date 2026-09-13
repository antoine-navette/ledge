// npx eslint --init

import * as js from '@eslint/js'; // Added "* as" to satisfies WebStorm
import * as globals from 'globals'; // Added "* as" to satisfies WebStorm
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    { ignores: ['./dist/'] }, // Added by me
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        plugins: { js },
        extends: ['js/recommended'],
        languageOptions: { globals: globals.node },
    },
    tseslint.configs.recommended,
]);
