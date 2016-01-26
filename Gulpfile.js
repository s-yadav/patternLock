
var rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    gulp = require('gulp');

gulp.task('default', function() {

    gulp.src('patternLock.js')
        .pipe(uglify())
        .pipe(rename('patternLock.min.js'))
        .pipe(gulp.dest('./'));
});
