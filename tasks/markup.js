import gulp from 'gulp';
import svgmin from 'gulp-svgmin';
import cheerio from 'gulp-cheerio';
import svgstore from 'gulp-svgstore';
import jade from 'gulp-jade'
import inject from 'gulp-inject';
import revReplace from 'gulp-rev-replace';
import fileinclude from 'gulp-file-include';
import plumber from 'gulp-plumber';
import { join } from 'path';

import browserSync from './connect';
import { src, dest } from './config';

let sprites;

gulp.task('sprites', () => {
  sprites = gulp.src(join(src, 'images', '**/*.svg'))
    .pipe(svgmin())
    .pipe(cheerio({
      run: function run($) {
        $('[fill]').removeAttr('fill');
      },
      parserOptions: { xmlMode: true },
    }))
    .pipe(svgstore({ inlineSvg: true }));
});

gulp.task('markup', ['sprites'], () => {
  const spriteTransform = (filePath, file) => {
    return file.contents.toString();
  };

  const mainPath = join(src, 'views', '**/*.jade');
  const includesPath = join('!.', src, 'views', 'includes', '**/*.jade');
  const manifest = gulp.src(join(dest, '..', 'rev-manifest.json'));

  gulp.src([
    mainPath,
    includesPath,
  ])
    .pipe(plumber())
    .pipe(jade())
    .pipe(inject(sprites, { transform: spriteTransform }))
    .pipe(fileinclude({
      basepath: join(__dirname, '..', src, 'views'),
    }))
    .pipe(revReplace({ manifest }))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream());
});
