import * as gulp from 'gulp';
import * as util from 'gulp-util';

import Config from '../../config';

let AWS = require('aws-sdk'),
    awspublish = require('gulp-awspublish'),
    merge = require('merge-stream'),
    parallelize = require('concurrent-transform'),
    invalidate = require('gulp-cloudfront-invalidate-aws-publish'),
    distPath = Config.PROD_DEST;

export = () => {
  if (!Config.PUBLISH_TASK_CONFIG || !Config.PUBLISH_TASK_CONFIG.s3 || !Config.PUBLISH_TASK_CONFIG.s3[Config.ENV]) {
    let err: string = `Missing PUBLISH_S3_CONFIG[${Config.ENV}] entry in project.config.ts`;
    util.log(util.colors.red(err));
    throw new Error(err);
  }

  let PTC = Config.PUBLISH_TASK_CONFIG;

  //Load PUBLISH_TASK_CONFIG.awsProfile if not already set in ENV or explicity set in SDK options
  if (!process.env.AWS_PROFILE && !!PTC.awsProfile && !PTC.s3[Config.ENV].credentials) {
    PTC.s3[Config.ENV].credentials = new AWS.SharedIniFileCredentials({profile: PTC.awsProfile});
  }

  let s3PublishConfig = PTC.s3[Config.ENV],
      patternsToGzip = (PTC.patternsToGzip && PTC.patternsToGzip.length) ? PTC.patternsToGzip : getDefaultGzipPatterns(),
      headers = getDefaultS3Headers(),
      gzipPatterns = patternsToGzip.map((p: string) => `${distPath}/${p}`),
  omitPatterns = (PTC.patternsToOmit && PTC.patternsToOmit.length) ? PTC.patternsToOmit : gzipPatterns,
    plainPatterns = omitPatterns.map((p: string) => '!' + p).concat(`${distPath}/**/*`),
    publisher = awspublish.create(s3PublishConfig);

  if (PTC.headers && PTC.headers[Config.ENV]) {
    headers = PTC.headers[Config.ENV];
  }

  let gzip = gulp.src(gzipPatterns).pipe(awspublish.gzip()),
      plain = gulp.src(plainPatterns);

  util.log('Publishing', util.colors.yellow(distPath));
  return merge(gzip, plain)
    .pipe(parallelize(publisher.publish(headers), 10))
    .pipe(awspublish.reporter());
};

function getDefaultGzipPatterns() {
  return ['**/*.js', '**/*.css', '**/*.html'];
}

function getDefaultS3Headers() {
  return {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };
}
