var gulp            = require("gulp");
var browserSync     = require("browser-sync");  /////服务器热更新
var less            = require("gulp-less");     /////less转css
var csso            = require('gulp-csso');     /////优化css
var cssmin          = require('gulp-minify-css');////css压缩
var autoprefixer    = require('gulp-autoprefixer');/////添加浏览器前缀
var assetRev        = require('gulp-asset-rev');//////css背景图添加版本号
var htmlmin         = require('gulp-htmlmin');//////压塑html
var uglify          = require('gulp-uglify');///////js压缩
var imagemin        = require('gulp-imagemin');/////压缩图片
var rev             = require('gulp-rev');  ///////添加版本号
var revCollectoe    = require('gulp-rev-collector');/////添加版本号
var runSequence     = require('gulp-sequence');    ////打包需要用到的工具
var data            = require('gulp-data');
var ejs             = require('gulp-ejs');
var fs              = require('fs');
var path            = require('path');
var gutil           = require('gulp-util');

gulp.task('testLess', function () {
    gulp.src('src/css/*.less') //多个文件以数组形式传入
        .pipe(less())
        .pipe(gulp.dest('src/css')); //将会在src/css下生成index.css以及detail.css 
});


gulp.task("cssMin",function(){

	  gulp.src('src/css/*.css') //多个文件以数组形式传入
	 .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 2.3','Firefox >= 13','> 5%','last 5 Explorer versions'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true 
        }))
	    .pipe(csso({
            restructure: false,
            sourceMap: true,
            debug: true
        }))
        .pipe(assetRev())
        .pipe(cssmin({
            advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: false,//类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
            //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        .pipe(gulp.dest('dist/css')); 
});


gulp.task('jsmin', function () {
    gulp.src('src/js/*')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});


gulp.task('imagemin',function(){
    gulp.src('src/images/*')
    .pipe(imagemin())
    .pipe(gulp.dest("dist/images"));
});

gulp.task("revCss",function(){

    gulp.src('src/css/*.css')
    .pipe(rev())
    .pipe(rev.manifest({
        'advanced':false,
        'compatibility':"ie7"
    }))
    .pipe(gulp.dest('rev/css'));


});

gulp.task("revJs",function(){

    gulp.src('src/js/*.js')
    .pipe(rev())
    .pipe(rev.manifest())
    .pipe(gulp.dest('rev/js'));


});


gulp.task('revHtml',function(){

    gulp.src(['rev/**/*.json','src/*.html'])
    .pipe(revCollectoe())
    .pipe(gulp.dest('src/'));

});


gulp.task('testHtmlmin', function () {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: false,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: false,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    gulp.src('src/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist/'));
});







gulp.task('as',["testLess","ejs"],browserSync.reload);
gulp.task("dev",function(){
    
    browserSync.init({
            server: "src"
    });
    
    gulp.watch("src/**/*.*",["as"]);
  

});
 


// 模版合并
gulp.task('ejs', function() {
	gulp.src('src/templates/*.html')
		.pipe(data(function(file) {

			var filePath = file.path;

			// global.json 全局数据，页面中直接通过属性名调用
			return Object.assign(JSON.parse(fs.readFileSync('src/templates/global.json')), {
				// local: 每个页面对应的数据，页面中通过 local.属性 调用
				local: JSON.parse(fs.readFileSync(path.join(path.dirname(filePath), path.basename(filePath, '.html') + '.json')))
			});
		}))
		.pipe(ejs().on('error',function(err){
			gutil.log(err);
			this.emit('end');
		}))
		.pipe(gulp.dest('src'));
});




gulp.task("dist",function(done){
  
    condition = false;
    runSequence(
       ['cssMin','jsmin','imagemin','revCss','revJs','revHtml','testHtmlmin'],done
    );

});