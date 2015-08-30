//required plugins
var gulp = require('gulp'),
		sass = require('gulp-sass'),
		sourcemaps = require('gulp-sourcemaps'),
		concat = require('gulp-concat'),
		uglify = require('gulp-uglify'),
		plumber = require('gulp-plumber'),
		beep = require('beepbeep'),
		svgSprite = require('gulp-svg-sprite'),
		imagemin = require('gulp-imagemin'),
		pngquant = require('imagemin-pngquant'),
		browserSync = require('browser-sync').create();


//project settings
var settings = {
	server: '',
	root: '',
	siteFiles: '**/*.html',
	sassDir: '_scss/**/*.scss',
	cssDest:  'assets/css',
	jsPlugins: [ //----not globbed, so we can control order	
		'_js/vendor/bootstrap.js'
		],
	jsDir: [
	'_js/global.js'
	],
	jsDest: 'assets/js',
	svgDir: '_svg/*.svg',
	svgDest: 'assets/svg',
	imgDir: '_img/*',
	imgDest: 'assets/img'
},

//passed to svgSprite
spriteOptions = {
	svg : {
		xmlDeclaration: false,
		doctypeDeclaration: false
	},
	mode: {
		symbol: {
			dest: '',
			sprite: 'sprite.svg'
		}
	}
},

//plumber error handling
onError = function(err) {
	beep();
	console.log(err);
	this.emit('end');
};


// serve/init browsersync
gulp.task('serve', ['sass'], function() {
	
	browserSync.init({
		server: {
      baseDir: settings.root
    },
    ghostMode: false
	});
	
	gulp.watch(settings.sassDir, ['sass']);
	gulp.watch(settings.jsDir, ['js']).on('change',browserSync.reload);
	gulp.watch(settings.siteFiles).on('change',browserSync.reload);
	gulp.watch(settings.svgDir, ['sprites']).on('change',browserSync.reload);

});


//compile sass
gulp.task('sass', function() {
	
	gulp.src(settings.sassDir)
		.pipe(plumber(onError))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(settings.cssDest))
		.pipe(browserSync.stream());

});


//creates js plugin file, from files in /vendor folder
gulp.task('jsplugins', function() {

	gulp.src(settings.jsPlugins)
		.pipe(concat('plugins.js'))
		.pipe(uglify())
		.pipe(gulp.dest(settings.jsDest));

});


//authored theme javascript
gulp.task('js', function() {

	gulp.src(settings.jsDir)
		.pipe(plumber(onError))
		.pipe(concat('global.js'))
		.pipe(uglify())
		.pipe(gulp.dest(settings.jsDest));

});


//sprite svgs from _svg folder
gulp.task('sprites', function() {

	gulp.src(settings.svgDir)
		.pipe(plumber(onError))
		.pipe(svgSprite(spriteOptions))
		.pipe(gulp.dest(settings.svgDest));

});


//optimize images
gulp.task('imgopt', function () {

  gulp.src(settings.imgDir)
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(gulp.dest(settings.imgDest));

});


//default gulp task
gulp.task('default', ['sass','jsplugins','js','serve']);