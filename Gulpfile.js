var gulp = require('gulp'),
	ts = require('gulp-typescript'),
	stylus = require('gulp-stylus'),
	plumber = require('gulp-plumber'),
	pug = require('gulp-pug'),
	concat = require('gulp-concat'),
	nib = require('nib'),
	livereload = require('gulp-livereload'),
	server = require('gulp-develop-server'),
	sourcemaps = require('gulp-sourcemaps'),
	install = require('gulp-install'),
	bower = require('gulp-bower'),
	del = require('del'),
	vinylPaths = require('vinyl-paths'),
	notifier = require('node-notifier'),
	tslint = require('gulp-tslint'),
	gutil = require('gulp-util'),
	path = require('path'),
	istanbul = require('gulp-istanbul'),
	TypeScript = require('typescript'),
	uglify = require('gulp-uglify'),
	print = require('gulp-print'),
	batch = require('gulp-batch'),
	runSequence = require('run-sequence'),
	argv = require('yargs').argv,
	babel = require('gulp-babel')
	webpack = require('webpack-stream'),
	merge = require('merge2'),
	mocha = require('gulp-mocha'),
	mongodb = require('mongodb');

var serverProject = ts.createProject({
	declarationFiles: true,
	noResolve: false,
	target: 'ES6',
	module: 'commonjs',
	typescript: TypeScript
});

var tsLintConfigured = function() {
	return tslint({
		configuration: {
			rules: {
				/* List all rules here */
				'ban': true,
				'class-name': true,
				'curly': true,
				'eofline': true,
				'forin': true,
				'indent': true,
				'interface-name': true,
				'label-position': true,
				'no-construct': true,
				'no-duplicate-variable': true,
				'no-eval': true,
				'no-switch-case-fall-through': true,
				'trailing-comma': [true,
					{
						'multiline': 'never',
						'singleline': 'never'
					}
				],
				'no-trailing-whitespace': true,
				'no-unused-expression': true,
				'no-use-before-declare': true,
				'one-line': [true,
					'check-open-brace',
					'check-whitespace'
				],
				'semicolon': true,
				'triple-equals': true,
				'whitespace': [true,
					'check-branch',
					'check-decl',
					'check-operator'
				]
			}
		}
	});
}

function tslintReporter(output, file, options) {
	gutil.log(gutil.colors.cyan('tslint'),file.path);
	var path = file.path;
	output.forEach(function(m) {
		console.log(
			gutil.colors.yellow("tslint "+path+":"+(m.startPosition.line+1)+":"+(m.startPosition.character+1)+":")+
			gutil.colors.red(m.failure),
			gutil.colors.magenta(" ("+m.ruleName+")")
		);
		notifier.notify({
			title: 'tslint '+path+':'+(m.startPosition.line+1),
			message: m.failure
		});
	});
}

var gotError = false;

function plumberErr() {
	return plumber({
		errorHandler: function() {
			gotError = true;
		}
	})
}
function resetErr() {
	gotError = false;
}
function isErr() {
	return gotError;
}

var compileServer = function() {
	var tsresults = gulp.src('server/src/**/*.ts')
		.pipe(sourcemaps.init())
		.pipe(tsLintConfigured())
		.pipe(tslint.report(tslintReporter, {}))
		.pipe(serverProject());
	return merge([
		tsresults.dts.pipe(gulp.dest('server/definitions')),
		tsresults.js.pipe(sourcemaps.write()).pipe(gulp.dest('server/lib'))
	]);
}


// gulp task responsible to do the test on the server side
gulp.task('test:server', ['compile:server'], function(cb) {
	if (isErr()) {
		console.log('Error, skipping test:server');
		return cb();
	}

	// process.env.TESTING = true;

	gulp.src([
		'server/lib/**/!(*_test).js'
	])
	.pipe(istanbul({includeUntested: true}))
	.pipe(istanbul.hookRequire())
	.on('finish', function() {
		gulp.src(
			['server/lib/**/*_test.js'], { read: false }
		)
		.pipe(plumber())
		.pipe(mocha({
			reporter: 'spec',
			timeout: 5000
		}))
		.pipe(istanbul.writeReports( {
			dir: 'reports/coverage-server',
			reporters: [ 'html' ],
			// reporters: [ 'lcov', 'json', 'text', 'text-summary' ],
			reportOpts: { dir: './reports/coverage-server' },
		}))
		.once('end', function() {
			// only exit if TTY, so we don't exit when running in WebStorm (where exit truncates the output)
			if (require('tty').isatty(1)) {
				process.exit();
			}
			cb();
		});
	});
});

gulp.task('reset_error', function() {
	resetErr();
});

gulp.task('compile:server', ['compile:jade-server'], function() {
	return compileServer();
});

gulp.task('compile:client', function() {
	return gulp.src([
		'client/src/**/*.ts'
	], {read: false})
	.pipe(webpack(
		require('./webpack.config.js')
	))
	.pipe(gulp.dest('public/js'));
})



gulp.task('compile:stylus', function(finished) {
	var exit = finished;
	/// Note: Correct async running
	gulp.src([
		'client/style/colors.styl',
		'client/style/base.styl',
		'client/style/main.styl',
		'client/src/**/*.styl'
		])
	.pipe(concat('all.styl'))
	.pipe(stylus({use:[nib]}))
	.on('error', function(err) {
		notifier.notify({
			title: 'Stylus compile error',
			message: err.message
		});
		/// Stylus breaks on error in parts and the pipeline does
		/// not continue. So, finish/exit here
		exit(err);
		exit = function() {}; /// make sure to call only once, just to be future-proof and double-safe
	})
	.pipe(gulp.dest('public/css/'))
	.on('end', function() {
		exit();
	})
	;
});

gulp.task('compile:pug', function() {
	return gulp.src('client/src/base.pug')
	.pipe(pug({
	}))
	.pipe(gulp.dest('public/'));
});

gulp.task('compile:png', function() {
	return gulp.src([
		'client/src/**/*.png'
	])
	 .pipe(gulp.dest('public'));
});

gulp.task('compile:jpg', function() {
	return gulp.src([
		'client/src/**/*.jpg'
	])
	 .pipe(gulp.dest('public'));
});

gulp.task('compile:svg', function() {
	return gulp.src([
		'client/src/**/*.svg'
	]).pipe(gulp.dest('public'))
});

gulp.task('compile:json', function() {
	/// Used (for now) only for onboarding config
	return gulp.src([
		'client/src/**/*.json'
	]).pipe(gulp.dest('public'))
});

gulp.task('compile:jade-server', function() {
	return gulp.src([
		'server/src/**/*.jade'
	]).pipe(gulp.dest('server/lib'))
});

gulp.task('compile:images', [
	'compile:jpg',
	'compile:png',
	'compile:svg']);

gulp.task('compile', [
	'compile:server',
	'compile:client',
	'compile:stylus',
	'compile:pug',
	'compile:images',
	'compile:json'
]);

gulp.task('server:restart', function() {
	compileServer()
	.pipe(
		server({
			path: 'server/lib/server.js'
		}))
	.pipe(
		livereload()
	);
});


gulp.task('develop', ['server:restart'], function(){
	gulp.watch('server/src/**/*.ts', ['server:restart']);
	gulp.watch('client/src/**/*.ts', ['compile:client']);
	gulp.watch('client/src/**/*.js', ['compile:client']);
	gulp.watch('client/src/**/*.pug', ['compile:client', 'compile:pug']);
	gulp.watch('client/src/**/*.styl', ['compile:stylus']);
	gulp.watch('client/style/*.styl', ['compile:stylus']);
	gulp.watch('client/src/**/*.json', ['compile:json']);
});



/* **************************** */

gulp.task('bower:install', function() {
	return bower().pipe(gulp.dest('public/components'));
});

gulp.task('install', ['bower:install'], function() {
	gulp.src(['./package.json'])
	.pipe(install());
});


gulp.task('update', function() {
	gulp.src(['./package.json']).pipe(install());
	bower({cmd:'update'});
});


/** Careful!
 * This deletes all generated files */
gulp.task('distclean', function() {
	return gulp.src([
		'./client/typings',
		'./node_modules',
		'./server/definitions',
		'./server/lib',
		'./server/typings',
		'./bower_components',
		'./public',
		'./reports'
	], {read:false})
	.pipe(vinylPaths(del))
	;
});

gulp.task('realtime:start', ['compile:server'], function() {
	var port = 3000;
	if (argv.secondary) port = port + 1;
	if (argv.port) port = argv.port;

	server.listen({
		path: 'server/lib/realtime/realtime-server.js',
		env: {
			PORT: port
		}
	});
});

gulp.task('develop:realtime', ['realtime:start'], function(){
	gulp.watch('server/src/**/*.ts', ['realtime:restart']);
});

gulp.task('default', ['compile']);
