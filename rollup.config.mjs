import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/jmenu.js',
    output: [
      {
        file: 'dist/jmenu.umd.js',
        format: 'umd',
        name: 'jmenu',
        sourcemap: true,
      },
      {
        file: 'dist/jmenu.umd.min.js',
        format: 'umd',
        name: 'jmenu',
        plugins: [terser()],
        sourcemap: true,
      },
      {
        file: 'dist/jmenu.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/jmenu.cjs.js',
        format: 'cjs',
        sourcemap: true,
      }
    ],
    plugins: [
      resolve(),
      commonjs()
    ]
  }
];