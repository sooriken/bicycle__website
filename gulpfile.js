//дефолтные переменные gulp
const { src, dest, watch, parallel, series } = require('gulp');

//объявление переменных пакетов
const sass         = require('gulp-sass')(require('sass'));
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const cssMinify    = require('gulp-css-minify');
const del          = require('del');
const pug          = require('gulp-pug');

//функция live-reload сервера
function browsersync(){
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

//функция очищения папки готового проекта
function cleanDist() {
    return del('dist')
}

//функция сжатия изображений
function images() {
    return src('app/images/**/*')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
                ]
            })
        ]
    ))
    .pipe(dest('dist/images'))
}

//функция минимизации js скриптов
function scripts() {
    return src('app/js/main.js')
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

// функция pug
function pugIndex() {
    return src('app/index.pug')
    .pipe (pug({pretty: true}))
    .pipe(dest('app'))
    .pipe(browserSync.stream())
}

// функция pug
function pugPages() {
    return src('app/pages/*.pug')
    .pipe (pug({pretty: true}))
    .pipe(dest('app/pages'))
    .pipe(browserSync.stream())
}

//функция минимизации sass файла с добавлением префиксов
function styles() {
    return src('app/sass/style.sass')
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

//функция сборки готового проекта
function build() {
    return src([
        'app/css/*.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html',
        'app/pages/*.html'
    ],  {base: 'app'})
        .pipe(dest('dist'))
}

//функция live изменений
function watching() {
    watch(['app/sass/**/*.sass'], styles)
    watch(['app/index.pug'], pugIndex)
    watch(['app/pages/*.pug'], pugPages)
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts)
    watch(['app/*.html']).on('change', browserSync.reload);
}

//экспорт функций
exports.styles      = styles;
exports.pugIndex  = pugIndex;
exports.pugPages  = pugPages;
exports.watching    = watching;
exports.browsersync = browserSync;
exports.scripts     = scripts;
exports.images      = images;
exports.cleanDist   = cleanDist;

//функция построения готового проекта
exports.build = series(cleanDist, images, build);
//экспорт дефолтной функции "gulp"
exports.default = parallel(scripts, browsersync, watching);

