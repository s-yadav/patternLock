import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

import fs from 'fs';

const babelConfig = JSON.parse(fs.readFileSync('.babelrc'));

const defaultConfig = {
  input: 'src/PatternLock.js',
  output: [{
    file: 'dist/patternlock.es.js',
    format: 'esm',
  }, {
    file: 'dist/patternlock.js',
    format: 'umd',
    name: 'PatternLock',
  }],
  plugins: [
    babel({
      babelrc: false,
      ...babelConfig,
      presets: [['env', { modules: false }]]
    }),
  ],
};

const minConfig = {
  ...defaultConfig,
  output: {
    file: 'dist/patternlock.min.js',
    format: 'umd',
    name: 'PatternLock',
  },
  plugins: [
    ...defaultConfig.plugins,
    uglify(),
  ],
};

export default [defaultConfig, minConfig];
