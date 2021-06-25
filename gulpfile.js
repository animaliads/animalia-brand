const { series, src, dest: dest } = require('gulp');

const tap = require('gulp-tap');
const del = require('del');
const { generateTokens } = require('./build');

const postcss = require('gulp-postcss');
var cssnano = require('cssnano');
const atImport = require('postcss-import');
var concat = require('gulp-concat');

const buildDestTheme = 'dist/theme';
const buildDestTypography = 'dist/typography';
const themeFileName = 'theme.css';

function clean(cb) {
  del.sync('./dist');
  cb();
}

function cleanTemp(cb) {
  del.sync('./.temp');
  cb();
}

function build(cb) {
  generateTokens();
  cb();
}

function copyPackageJson(filename, path, destFile) {
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

}

function copyThemePackageJson(cb) {
  copyPackageJson(themeFileName, '.', buildDestTheme)
  cb();
}

const copyThemeAssets = () =>
  src('./src/theme/assets/**/*.*').pipe(dest(buildDestTheme));

function buildComponents(cb) {
  src(['./.temp/**/**.css', './src/theme/**/**.css'])
    .pipe(
      postcss([
        atImport(),
        cssnano(),
      ])
    )
    .pipe(concat(themeFileName))
    .pipe(dest(buildDestTheme))
  cb()
}

function buildTypography(cb) {
  src('./src/helpers/typography/**/**.css')
  .pipe(
    postcss([
      atImport(),
      cssnano(),
    ])
  )
  .pipe(concat('index.css'))
  .pipe(dest(buildDestTypography))

  copyPackageJson('index.css', './src/helpers/typography', buildDestTypography);

  cb()
}

exports.build = build;
exports.default = series(
  clean,
  build,
  buildComponents,
  copyThemeAssets,
  copyThemePackageJson,
  cleanTemp,
  buildTypography
);