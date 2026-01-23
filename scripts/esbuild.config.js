const esbuild = require('esbuild');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

const buildOptions = {
  entryPoints: [path.resolve(__dirname, '../src/consumers/extension.ts')],
  bundle: true,
  outfile: path.resolve(__dirname, '../out/consumers/extension.js'),
  external: ['vscode'], // vscode is provided by the VS Code runtime
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  minify: isProduction,
  treeShaking: true,
  logLevel: 'info',
};

async function build() {
  try {
    await esbuild.build(buildOptions);
    console.log('Extension bundled successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

async function watch() {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.log('Watching for changes...');
}

if (require.main === module) {
  const command = process.argv[2];
  if (command === 'watch') {
    watch();
  } else {
    build();
  }
}

module.exports = { build, watch, buildOptions };
