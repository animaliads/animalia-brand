const { series, src, dest: dest } = require('gulp');

const tap = require('gulp-tap');
const del = require('del');
const { generateTokens } = require('./build');

const postcss = require('gulp-postcss');
var cssnano = require('cssnano');
const atImport = require('postcss-import');
var concat = require('gulp-concat');

const buildDest = 'dist';
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

function copyPackageJson(cb) {
  src('package.json')
    .pipe(
      tap(file => {
        const contents = JSON.parse(file.contents.toString());

        delete contents.devDependencies;
        delete contents.scripts;

        contents.main = themeFileName;

        file.contents = Buffer.from(JSON.stringify(contents, null, 2), 'utf-8');
      })
    )
    .pipe(dest(buildDest));

  cb();

}

const copyThemeAssets = () =>
  src('./src/theme/assets/**/*.*').pipe(dest(buildDest));

function buildComponents(cb) {
  src(['./.temp/**/**.css', './src/theme/**/**.css'])
    .pipe(
      postcss([
        atImport(),
        cssnano(),
      ])
    )
    .pipe(concat(themeFileName))
    .pipe(dest(buildDest))
  cb()
}
exports.build = build;
exports.default = series(
  clean,
  build,
  buildComponents,
  copyThemeAssets,
  copyPackageJson,
  cleanTemp
);