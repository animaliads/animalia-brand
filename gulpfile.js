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

function generateTokens(cb) {
  generateTokens();
  cb();
}

function copyPackageJson(cb, filename, path, destFile) {
  src(`${path}/package.json`)
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

  cb();

}


const copyThemeAssets = () =>
  src('./src/theme/assets/**/*.*').pipe(dest(buildDestTheme));


function generateThemePackageJson(cb) {
  copyPackageJson(cb, themeFileName, '.', buildDestTheme);
}

function generateThemeBunddle(cb) {
  generateBunddle(
    cb,
    ['./.temp/**/**.css', './src/theme/**/**.css'],
    themeFileName,
    buildDestTheme
  );

  cb();
}

function generateBunddle(cb, input, fileName, buildDest) {
  src(input)
    .pipe(
      postcss([
        atImport(),
        cssnano(),
      ])
    )
    .pipe(concat(fileName))
    .pipe(dest(buildDest));

  cb();
}

function generateBunddleHelpers(cb) {
  const helpers = ['typography'];

  helpers.forEach(helper => {
    const buildDest = `dist/${helper}`;
    const inputFiles = `./src/helpers/${helper}/src/index.css`;

    generateBunddle(
      cb,
      inputFiles,
      'index.css',
      buildDest
    );

    copyPackageJson(cb, 'index.css', `./src/helpers/${helper}`, buildDest);
  });

  cb();
}


const generateBunddleTheme = series(
  generateThemeBunddle,
  copyThemeAssets,
  generateThemePackageJson
)

exports.default = series(
  clean,
  generateTokens,
  generateBunddleTheme,
  cleanTemp,
  generateBunddleHelpers
);