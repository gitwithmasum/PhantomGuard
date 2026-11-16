const assert = require('assert');
const { ImportParser } = require('../out/parsers/importParser');
const { DependencyFileParser } = require('../out/parsers/dependencyFileParser');
const { FuzzySearch } = require('../out/utils/fuzzySearch');

console.log('--- RUNNING PHANTOMGUARD IMPORT & DEPENDENCY TESTS ---');

// Test 1: JS/TS imports
const sampleTsCode = `
import React, { useState } from 'react';
import { debounce } from 'lodash/debounce';
import * as fs from 'fs';
import nodePath from 'node:path';
import { Button } from './components/Button';
import { UserCard } from '@/components/UserCard';
import { magicalModal } from 'hallucinated-ai-package-123';
import { client } from '@my-org/super-lib/sub';
const legacy = require('legacy-pkg');
const dyn = import('dynamic-loader');
`;

const tsImports = ImportParser.parse(sampleTsCode, 'typescript');
assert.strictEqual(tsImports.find((i) => i.raw === 'react').packageName, 'react');
assert.strictEqual(tsImports.find((i) => i.raw === 'lodash/debounce').packageName, 'lodash');
assert.strictEqual(tsImports.find((i) => i.raw === 'fs').isBuiltin, true);
assert.strictEqual(tsImports.find((i) => i.raw === 'node:path').isBuiltin, true);
assert.strictEqual(tsImports.find((i) => i.raw === './components/Button').isLocal, true);
assert.strictEqual(tsImports.find((i) => i.raw === '@/components/UserCard').isLocal, true);
assert.strictEqual(tsImports.find((i) => i.raw === 'hallucinated-ai-package-123').isBuiltin, false);
assert.strictEqual(tsImports.find((i) => i.raw === 'hallucinated-ai-package-123').isLocal, false);
console.log('✔ JS/TS import extraction passed');

// Test 2: Python imports
const samplePyCode = `
import os
import sys
import numpy as np
from datetime import datetime
from phantom_math_solver import solve
from .local_module import helper
import pandas, torch
`;

const pyImports = ImportParser.parse(samplePyCode, 'python');
assert.strictEqual(pyImports.find((i) => i.raw === 'os').isBuiltin, true);
assert.strictEqual(pyImports.find((i) => i.raw === 'numpy').packageName, 'numpy');
assert.strictEqual(pyImports.find((i) => i.raw === 'phantom_math_solver').packageName, 'phantom_math_solver');
console.log('✔ Python import extraction passed');

// Test 3: package.json dependencies
const samplePackageJson = `{
  "name": "my-app",
  "dependencies": {
    "react": "^18.2.0",
    "fake-phantom-dep": "^1.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}`;

const pkgDeps = DependencyFileParser.parsePackageJson(samplePackageJson);
assert.strictEqual(pkgDeps.length, 4);
assert.strictEqual(pkgDeps.find((d) => d.packageName === 'react').ecosystem, 'npm');
assert.strictEqual(pkgDeps.find((d) => d.packageName === 'fake-phantom-dep').packageName, 'fake-phantom-dep');
assert.strictEqual(pkgDeps.find((d) => d.packageName === '@tanstack/react-query').packageName, '@tanstack/react-query');
assert.strictEqual(pkgDeps.find((d) => d.packageName === 'typescript').packageName, 'typescript');
console.log('✔ package.json dependency extraction passed');

// Test 4: requirements.txt dependencies
const sampleReqs = `
# Core deps
numpy==1.24.0
pandas>=2.0.0
fake-ai-python-pkg==0.1.0
torch
-r other-requirements.txt
`;

const reqDeps = DependencyFileParser.parseRequirementsTxt(sampleReqs);
assert.strictEqual(reqDeps.length, 4);
assert.strictEqual(reqDeps.find((d) => d.packageName === 'numpy').ecosystem, 'pypi');
assert.strictEqual(reqDeps.find((d) => d.packageName === 'fake-ai-python-pkg').packageName, 'fake-ai-python-pkg');
console.log('✔ requirements.txt dependency extraction passed');

// Test 5: Levenshtein distance
assert.strictEqual(FuzzySearch.levenshtein('lodsh', 'lodash'), 1);
assert.strictEqual(FuzzySearch.levenshtein('reqeust', 'request'), 2);
console.log('✔ Levenshtein fuzzy matching passed');

console.log('\n[PASS] All 5 PhantomGuard test suites passed with 100% precision!\n');
