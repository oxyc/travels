var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var cp = require('child_process');
var livereload = require('gulp-livereload');
var express = require('express');
var prefix = require('gulp-autoprefixer');
var inlineimage = require('gulp-inline-image');

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

gulp.task('jekyll', function (done) {
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('exit', function () {
      console.log('-- Finished Jekyll build --');
    })
    .on('close', done);
});

gulp.task('scripts-thirdparty', function () {
  return gulp.src(source.scriptsThirdParty)
    .pipe(concat('thirdparty.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('_site/dist'))
    .pipe(livereload());
});

gulp.task('scripts', function () {
  return gulp.src(source.scripts)
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('_site/dist'))
    .pipe(livereload());
});

gulp.task('stylesheets-abovefold', function () {
  return gulp.src(source.stylesheetsAboveFold)
    .pipe(sass())
    .pipe(inlineimage())
    .pipe(prefix(['> 1%', 'IE 8', 'IE 9']))
    .pipe(concat('abovefold.css'))
    .pipe(minifyCss({
      relativeTo: '/dist/'
    }))
    .pipe(gulp.dest('_includes'))
    .pipe(livereload());
});

gulp.task('stylesheets', function () {
  return gulp.src(source.stylesheets)
    .pipe(sass())
    .pipe(prefix(['> 1%', 'IE 8', 'IE 9']))
    .pipe(concat('stylesheet.min.css'))
    .pipe(minifyCss({
      relativeTo: '/dist/'
    }))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('_site/dist'))
    .pipe(livereload());
});

gulp.task('images', function () {
  return gulp.src(source.images)
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(gulp.dest('dist/images'))
    .pipe(gulp.dest('_site/dist/images'))
    .pipe(livereload());
});

gulp.task('serve', function () {
  var server = express();
  server.use(express.static('_site/'));
  server.listen(4000);
});

gulp.task('watch', function () {
  livereload.listen();

  gulp.watch(source.stylesheetsAboveFold, ['stylesheets-abovefold', 'jekyll']);
  gulp.watch(source.stylesheets, ['stylesheets']);
  gulp.watch(source.scripts, ['scripts']);
  gulp.watch(source.scriptsThirdParty, ['scripts-thirdparty']);
  gulp.watch(['{,*/}*.html', '{,*/}*.md', '!_site/**', '!_site/*/**'], ['jekyll']);

  gulp.watch(['_site/*/**']).on('change', function (file) {
    livereload.changed(file);
  });
});

gulp.task('build', ['stylesheets', 'stylesheets-abovefold', 'scripts', 'scripts-thirdparty']);
gulp.task('default', ['build', 'jekyll', 'serve', 'watch']);
