const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const del = require("del");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");
const webp = require("gulp-webp");
const terser = require("gulp-terser");
const htmlmin = require("gulp-htmlmin");

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;


// Image optimization

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo()
    ]))
}

exports.images = images;


const createWebp = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"))
}

exports.createWebp = createWebp;


const sprite = () => {
  return gulp.src("source/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;


// Build

const clean = () => {
  return del("build");
};

exports.clean = clean;


const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/*.ico",
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
};

exports.copy = copy;

const html = () => {
  return gulp.src([
    "source/*.html"
  ], {
    base: "source"
  })
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest("build"));
};

exports.html = html;

const scripts = () => {
  return gulp.src("source/js/**/*.js")
    .pipe(terser())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("build/js"))
};

exports.scripts = scripts;


const build = gulp.series(
  clean, images, createWebp, sprite, copy, html, styles, scripts
);

exports.build = build;


// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;


const reload = (done) => {
  sync.reload();
  done();
};

exports.reload = reload;


// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/js/**/*.js", gulp.series("scripts"));
  gulp.watch("source/*.html").on("change", gulp.series("html", "reload"));
};

exports.default = gulp.series(
  build, server, watcher
);
