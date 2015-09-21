var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');

var source = {
  scriptsThirdParty: [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/lodash/lodash.js',
    'bower_components/leaflet/dist/leaflet-src.js',
    'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
    'bower_components/select2/dist/js/select2.js',
    'bower_components/highcharts/highcharts.js',
    'bower_components/slick-carousel/slick/slick.js',
    'bower_components/fraction.js/fraction.js',
    'bower_components/Leaflet.MakiMarkers/Leaflet.MakiMarkers.js',
    'bower_components/leaflet-omnivore/leaflet-omnivore.js',
    'bower_components/leaflet-search/src/leaflet-search.js',
    'bower_components/tinytooltip/src/jquery.tinytooltip.js',
    'js/jquery.whenall.js',
    'js/jquery.cachedscript.js'
  ],
  scripts: [
    'js/map.js',
    'js/slideshow.js',
    'js/charts.js',
    'js/commits.js'
  ],
  stylesheetsAboveFold: [
    'stylesheets/normalize.css',
    'stylesheets/stylesheet.css',
    'stylesheets/inline.scss'
  ],
  stylesheets: [
    'bower_components/leaflet/dist/leaflet.css',
    'bower_components/select2/dist/css/select2.min.css',
    'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
    'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
    'bower_components/slick-carousel/slick/slick.css',
    'bower_components/slick-carousel/slick/slick-theme.css',
    'bower_components/leaflet-search/dist/leaflet-search.min.css',
    'bower_components/tinytooltip/src/jquery.tinytooltip.css',
    'stylesheets/custom.scss'
  ],
  images: ['images/{,*/}*.{png,jpg,jpeg,gif}']
};

gulp.task('scripts-thirdparty', function () {
  return gulp.src(source.scriptsThirdParty)
    .pipe(concat('thirdparty.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});
gulp.task('scripts', function () {
  return gulp.src(source.scripts)
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});
gulp.task('stylesheets-abovefold', function () {
  return gulp.src(source.stylesheetsAboveFold)
    .pipe(sass())
    .pipe(concat('abovefold.css'))
    .pipe(minifyCss({
      relativeTo: '/dist/'
    }))
    .pipe(gulp.dest('_includes'));
});
gulp.task('stylesheets', function () {
  return gulp.src(source.stylesheets)
    .pipe(sass())
    .pipe(concat('stylesheet.min.css'))
    .pipe(minifyCss({
      relativeTo: '/dist/'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src(source.images)
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('build', ['stylesheets', 'stylesheets-abovefold', 'scripts', 'scripts-thirdparty']);
