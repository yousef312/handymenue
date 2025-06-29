import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/HandyMenue.js',
    output: [
      {
        file: 'dist/HandyMenue.umd.js',
        format: 'umd',
        name: 'HandyMenue',
        sourcemap: true,
      },
      {
        file: 'dist/HandyMenue.umd.min.js',
        format: 'umd',
        name: 'HandyMenue',
        plugins: [terser()],
        sourcemap: true,
      },
      {
        file: 'dist/HandyMenue.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/HandyMenue.cjs.js',
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