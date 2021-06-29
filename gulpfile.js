const { series, src, dest: dest } = require('gulp');

const tap = require('gulp-tap');
const del = require('del');
const { generateTokens } = require('./build');

const postcss = require('gulp-postcss');
var cssnano = require('cssnano');
const atImport = require('postcss-import');
const concat = require('gulp-concat');

const buildDestTheme = 'dist/theme';
const themeFileName = 'theme.css';

function clean(cb) {
  del.sync('./dist');
  cb();
}

function cleanTemp(cb) {
  del.sync('./.temp');
  cb();
}

function copyPackageJson(filename, path, destFile) {
  return src(`${path}/package.json`)
    .pipe(
      tap(file => {
        const contents = JSON.parse(file.contents.toString());

        delete contents.devDependencies;
        delete contents.scripts;

        contents.main = filename;

        file.contents = Buffer.from(JSON.stringify(contents, null, 2), 'utf-8');
      })
    )
    .pipe(dest(destFile));
}


const copyThemeAssets = () =>
  src('./src/theme/assets/**/*.*').pipe(dest(buildDestTheme));


function generateThemePackageJson() {
  return copyPackageJson(themeFileName, '.', buildDestTheme);
}

function generateThemeBunddle() {
  return generateBunddle(
    ['./.temp/**/**.css', './src/theme/**/**.css'],
    themeFileName,
    buildDestTheme
  );
}

function generateBunddle(input, fileName, buildDest) {
  return src(input)
    .pipe(
      postcss([
        atImport(),
        cssnano(),
      ])
    )
    .pipe(concat(fileName))
    .pipe(dest(buildDest));
}

function generateBunddleHelpers() {
  const helpers = ['typography'];
  const bunddleFileName = 'index.css';

  helpers.forEach(helper => {
    const buildDest = `dist/${helper}`;
    const inputFiles = `./src/helpers/${helper}/src/index.css`;

    generateBunddle(
      inputFiles,
      bunddleFileName,
      buildDest
    );

    copyPackageJson(bunddleFileName, `./src/helpers/${helper}`, buildDest);
  });

  return Promise.resolve();
};


const generateBunddleTheme = series(
  generateThemeBunddle,
  copyThemeAssets,
  generateThemePackageJson
);



exports.default = series(
  clean,
  generateTokens,
  generateBunddleTheme,
  cleanTemp,
  generateBunddleHelpers
);