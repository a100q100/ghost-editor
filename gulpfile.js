// GULP MODULES ===============================================================
var gulp          = require('gulp');
var concat        = require('gulp-concat');
var uglify        = require('gulp-uglify');
var minifyCSS     = require('gulp-minify-css');
var minifyHTML    = require('gulp-minify-html');
var connect       = require('gulp-connect');
var less          = require('gulp-less');
var jshint        = require('gulp-jshint');
var templateCache = require('gulp-angular-templatecache');
var replace       = require('gulp-replace');
var stylish       = require('jshint-stylish');
var exec          = require('child_process').exec;
var fs            = require('fs');
var merge         = require('merge-stream');

// VARIABLES ==================================================================
var project       = JSON.parse(fs.readFileSync('package.json', 'utf8'));
var build_version = project.version;
var build_date    = (new Date()).toISOString().replace(/T.*/, '');
var build_env     = 'DEVELOPMENT';

// FILES ======================================================================
var vendor_js = [
  'src/assets/libs/createjs.min.js',
  'src/assets/libs/creatine-1.0.0.min.js',
  'src/assets/libs/behavior3js-0.1.0.min.js',
  'src/assets/libs/mousetrap.min.js',
  'bower_components/angular/angular.min.js',
  'bower_components/angular-animate/angular-animate.min.js',
  'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
  'bower_components/angular-ui-router/release/angular-ui-router.min.js',
  'bower_components/sweetalert/dist/sweetalert.min.js',
];
var vendor_css = [
  'bower_components/bootstrap/dist/css/bootstrap.min.css',
  'bower_components/sweetalert/dist/sweetalert.css',
];
var vendor_fonts = [
  'bower_components/font-awesome/fonts/*',
  'src/assets/fonts/**/*',
];

var preload_js = [
  'src/assets/js/preload.js',
];

var preload_css = [
  'bower_components/font-awesome/css/font-awesome.min.css',
  'src/assets/css/fonts.css',
  'src/assets/css/preload.css',
];

var app_js = [
  'src/editor/namespaces.js',
  'src/editor/node/**/*.js',
  'src/editor/utils/**/*.js',
  'src/editor/**/*.js',
  'src/app/app.js',
  'src/app/app.routes.js',
  'src/app/app.controller.js',
  'src/app/**/*.js',
  'src/start.js',
];
var app_less = [
  'src/assets/less/index.less',
];
var app_html = [
  'src/app/**/*.html',
];
var app_entry = [
  'src/index.html',
  'src/package.json',
]

var build_platforms = ['win32'];//, 'linux32', 'osx32'];

// TASKS (BUILD) ==============================================================
gulp.task('_build_config', function() {
  build_env = 'PRODUCTION';
});

// TASKS (VENDOR) =============================================================
gulp.task('_vendor_js', function() {
  return gulp.src(vendor_js)
             .pipe(uglify())
             .pipe(concat('vendor.min.js'))
             .pipe(gulp.dest('build/js'))
});

gulp.task('_vendor_css', function() {
  return gulp.src(vendor_css)
             .pipe(minifyCSS())
             .pipe(concat('vendor.min.css'))
             .pipe(gulp.dest('build/css'))
});

gulp.task('_vendor_fonts', function() {
  return gulp.src(vendor_fonts)
             .pipe(gulp.dest('build/fonts'))
});

gulp.task('_vendor', ['_vendor_js', '_vendor_css', '_vendor_fonts']);


// TASKS (PRELOAD) ============================================================
gulp.task('_preload_js', function() {
  return gulp.src(preload_js)
             .pipe(uglify())
             .pipe(concat('preload.min.js'))
             .pipe(gulp.dest('build/js'))
             .pipe(connect.reload())
});

gulp.task('_preload_css', function() {
  return gulp.src(preload_css)
             .pipe(minifyCSS())
             .pipe(concat('preload.min.css'))
             .pipe(gulp.dest('build/css'))
             .pipe(connect.reload())
});

gulp.task('_preload', ['_preload_js', '_preload_css']);


// TASKS (APP) ================================================================
gulp.task('_app_js_dev', function() {
  return gulp.src(app_js)
             .pipe(jshint())
             .pipe(jshint.reporter(stylish))
             .pipe(concat('app.min.js'))
             .pipe(replace('[BUILD_VERSION]', build_version))
             .pipe(replace('[BUILD_DATE]', build_date))
             .pipe(replace('[BUILD_ENV]', build_env))
             .pipe(gulp.dest('build/js'))
             .pipe(connect.reload())
});

gulp.task('_app_js_build', function() {
  return gulp.src(app_js)
             .pipe(jshint())
             .pipe(jshint.reporter(stylish))
             .pipe(uglify())
             .pipe(concat('app.min.js'))
             .pipe(replace('[BUILD_VERSION]', build_version))
             .pipe(replace('[BUILD_DATE]', build_date))
             .pipe(replace('[BUILD_ENV]', build_env))
             .pipe(gulp.dest('build/js'))
             .pipe(connect.reload())
});

gulp.task('_app_less', function() {
  return gulp.src(app_less)
             .pipe(less())
             .pipe(minifyCSS())
             .pipe(concat('app.min.css'))
             .pipe(gulp.dest('build/css'))
             .pipe(connect.reload())
});

gulp.task('_app_html', function() {
  return gulp.src(app_html)
             .pipe(minifyHTML({empty:true})) 
             .pipe(replace('[BUILD_VERSION]', build_version))
             .pipe(replace('[BUILD_DATE]', build_date))
             .pipe(replace('[BUILD_ENV]', build_env))
             .pipe(templateCache('templates.min.js', {standalone:true}))
             .pipe(gulp.dest('build/js'))
             .pipe(connect.reload())
});

gulp.task('_app_entry', function() {
  return gulp.src(app_entry)
             .pipe(minifyHTML({empty:true})) 
             .pipe(replace('[BUILD_VERSION]', build_version))
             .pipe(replace('[BUILD_DATE]', build_date))
             .pipe(replace('[BUILD_ENV]', build_env))
             .pipe(gulp.dest('build'))
             .pipe(connect.reload())
});

gulp.task('_app_dev', ['_app_js_dev', '_app_less', '_app_html', '_app_entry']);
gulp.task('_app_build', ['_app_js_build', '_app_less', '_app_html', '_app_entry']);


// TASKS (LIVE RELOAD) ========================================================
gulp.task('_livereload', function() {
  connect.server({
    livereload: true,
    root: 'build',
    port: 8000,
  });
});

gulp.task('_serve', ['_vendor', '_preload', '_app_dev' ,'_livereload'], function() {
  gulp.watch(preload_js, ['_preload_js']);
  gulp.watch(preload_css, ['_preload_css']);
  gulp.watch(app_js, ['_app_js_dev']);
  gulp.watch(app_less, ['_app_less']);
  gulp.watch(app_html, ['_app_html']);
  gulp.watch(app_entry, ['_app_entry']);
});


// TASKS (NODE WEBKIT) ========================================================
gulp.task('_nw', ['build'], function() {
  exec('cd build & nw .');
});

gulp.task('_dist', ['build'], function() {
  exec('nwbuild -o dist/ -p '+build_platforms.join(',')+' -v 0.12.2 build');
});


// COMMANDS ===================================================================
gulp.task('build', ['_build_config', '_vendor', '_preload', '_app_build']);
gulp.task('serve', ['_serve']);
gulp.task('nw',    ['_nw']);
gulp.task('dist',  ['_dist'])