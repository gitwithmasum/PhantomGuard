const assert = require('assert');
const { ImportParser } = require('../out/parsers/importParser');

console.log('--- RUNNING PHANTOMGUARD IMPORT PARSER TESTS ---');

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
console.log(`Found ${tsImports.length} JS/TS imports:`);
tsImports.forEach((imp) => {
  console.log(` - ${imp.raw} => Package: "${imp.packageName}" (Builtin: ${imp.isBuiltin}, Local: ${imp.isLocal})`);
});

// Assertions for TS
assert.strictEqual(tsImports.find((i) => i.raw === 'react').packageName, 'react');
assert.strictEqual(tsImports.find((i) => i.raw === 'lodash/debounce').packageName, 'lodash');
assert.strictEqual(tsImports.find((i) => i.raw === 'fs').isBuiltin, true);
assert.strictEqual(tsImports.find((i) => i.raw === 'node:path').isBuiltin, true);
assert.strictEqual(tsImports.find((i) => i.raw === './components/Button').isLocal, true);
assert.strictEqual(tsImports.find((i) => i.raw === '@/components/UserCard').isLocal, true);
assert.strictEqual(tsImports.find((i) => i.raw === 'hallucinated-ai-package-123').isBuiltin, false);
assert.strictEqual(tsImports.find((i) => i.raw === 'hallucinated-ai-package-123').isLocal, false);
assert.strictEqual(tsImports.find((i) => i.raw === '@my-org/super-lib/sub').packageName, '@my-org/super-lib');
assert.strictEqual(tsImports.find((i) => i.raw === 'legacy-pkg').packageName, 'legacy-pkg');
assert.strictEqual(tsImports.find((i) => i.raw === 'dynamic-loader').packageName, 'dynamic-loader');

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
console.log(`\nFound ${pyImports.length} Python imports:`);
pyImports.forEach((imp) => {
  console.log(` - ${imp.raw} => Package: "${imp.packageName}" (Builtin: ${imp.isBuiltin})`);
});

assert.strictEqual(pyImports.find((i) => i.raw === 'os').isBuiltin, true);
assert.strictEqual(pyImports.find((i) => i.raw === 'sys').isBuiltin, true);
assert.strictEqual(pyImports.find((i) => i.raw === 'numpy').packageName, 'numpy');
assert.strictEqual(pyImports.find((i) => i.raw === 'phantom_math_solver').packageName, 'phantom_math_solver');
assert.strictEqual(pyImports.find((i) => i.raw === 'phantom_math_solver').isBuiltin, false);
assert.strictEqual(pyImports.find((i) => i.raw === 'pandas').packageName, 'pandas');
assert.strictEqual(pyImports.find((i) => i.raw === 'torch').packageName, 'torch');

console.log('\n[PASS] All ImportParser tests succeeded with 100% precision!\n');
