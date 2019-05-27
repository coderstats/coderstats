var gulp = require('gulp'),
    babel = require('gulp-babel'),
    minify = require('gulp-babel-minify'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    spawn = require('child_process').spawn,
    sass = require('gulp-sass')
    tildeImporter = require('node-sass-tilde-importer');

var do_minify = true;

var paths = {
    babel: 'src/js/*.js',
    compiled: 'static/compiled',
    scss: 'src/scss/*.scss',
    scss_coder: 'src/scss/coder.scss',
    scss_main: 'src/scss/style.scss'
};

// Compile babel scripts
gulp.task('babel', function() {
    var ret = gulp.src(paths.babel).pipe(babel());
    if (do_minify)
        ret = ret.pipe(minify())
    return ret.pipe(gulp.dest(paths.compiled));
});

// Run dev server
gulp.task('serve', function() {
    var log = function (data) { console.log(data.toString()) };
    lserve = spawn('logya', ['serve']);
    lserve.stdout.on('data', log);
    lserve.stderr.on('data', log);
});

// Compile and copy scss styles
gulp.task('scss', function () {
    gulp.src(paths.scss_coder)
        .pipe(sass({importer: tildeImporter}).on('error', sass.logError))
        .pipe(cleanCSS())
        .pipe(concat('coder.css'))
        .pipe(gulp.dest(paths.compiled));

    return gulp.src(paths.scss_main)
        .pipe(sass({importer: tildeImporter}).on('error', sass.logError))
        .pipe(cleanCSS())
        .pipe(concat('style.css'))
        .pipe(gulp.dest(paths.compiled));
});

// Rerun task when a file changes
gulp.task('watch', function() {
    // don't minify while working on code
    do_minify = false;
    gulp.watch(paths.scss, ['scss']);
    gulp.watch(paths.babel, ['babel']);
});

// Build the JavaScript and CSS files
gulp.task('dist', ['babel', 'scss']);

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['dist', 'watch', 'serve']);