const gulp = require("gulp");
const sass = require("gulp-sass");
var browserSync = require('browser-sync').create()

browserSync.init({
  proxy:'localhost:8080'
});
gulp.task('styles', function() {
    gulp.src('./sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/styles/'));
});

gulp.task('watch', function (){
  gulp.watch('./sass/**/*', ['styles'])
  gulp.watch('./public/**/*').on('change', browserSync.reload);
})

gulp.task('default', ['watch']);



