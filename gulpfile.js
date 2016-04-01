'use strict';

var gulp = require('gulp');
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var connect = require('gulp-connect')

gulp.task('connect', function () {
    connect.server({
        root: 'public',
        https: true,
        livereload: true,
        port: 4000
    })
});

gulp.task('browserify', function() {
  // Grabs the app.js file
  return browserify('./app/application.js')
      // bundles it and creates a file called main.js
      .bundle()
      .pipe(source('main.js'))
      // saves it the public/js/ directory
      .pipe(gulp.dest('./public/js/'));
});

gulp.task('watch', function() {
    gulp.watch('./app/**/*.js', ['browserify'])
    gulp.watch('./app/*.js', ['browserify'])
})


gulp.task('default', ['connect', 'watch']);