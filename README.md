# angular-seed-publish-task
gulp task plugin for [mgechev/angular-seed](https://github.com/mgechev/angular-seed) that gzips and publishes angular app to s3 with CloudFront invalidations

If you would like to learn how to setup an Anuglar2 app on S3+CloudFront with a free SSL cert read my blog post TODO: add blog post

## Quickstart

*  Clone this repo, and copy `task/awspublish.ts` your angular-seed projects `tools/tasks/project` dir. Simlinks do not work and are not advised.
*  Run `npm install --save-dev gulp-awspublish merge-stream concurrent-transform gulp-cloudfront-invalidate-aws-publish`
*  In your `tools/config/project.config.ts` add the following **before** your `constructor()`. Add another index for each of your stages at the same level as `prod` below:
```js
PUBLISH_TASK_CONFIG: any = {
    prod: {
      awsProfile: 'alayna-page',  //Can use AWS_PROFILE env var instead (AWS_PROFILE=alayna-page gulp awspublish)
      patternsToGzip: ['**/*.js', '**/*.css', '**/*.html'],
      patternsToOmit: [], //By default won't omit anything (will upload entire dist/prod dir
      s3: {        //@see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
        params: {
          Bucket: 'www.alaynapage.org'
        }
      },
      headers: {},  //Headers to add to all objects
      cf: {        //@see https://github.com/lpender/gulp-cloudfront-invalidate-aws-publish
        distribution: 'E2A654H2YRPD0W'
      }
    },
  };
```
*  In your `package.json` add an entry for each of your stages in the `scripts` section:

```json
"scripts": {
    "awspublish.prod": "gulp awspublish --color --build-type prod --awspublish-stage prod",
    "awspublish.staging": "gulp awspublish --color --build-type prod --awspublish-stage staging",    
}
```

*  Build your Angular app via normal angular-seed process (ex: `npm run build.prod.exp`). Then run your publish task. Ex: `gulp awspublish.prod`

## Details

*  `--awspublish-stage` dictates which stage index of `PUBLISH_TASK_CONFIG` to use.
*  By default all assets in `dist/prod` will be uploaded to s3 with `public-read` permissions.
*  **awsProfile**: The AWS SDK profile to use when uploading to S3 and invalidating CF objects.  See [the AWS SDK config guide](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html)
*  **patternsToGzip**: `gulp.src` patterns to gzip, relative to the angular-seed `dist/prod` dir. Default: `['**/*.js', '**/*.css', '**/*.html']`
*  **patternsToOmit**: `gulp.src` patterns to not upload to s3, relative to the angular-seed `dist/prod` dir. By default `dist/prod/**/*` will be uploaded (after gzip).
*  **s3**: The AWSConfig object used to create an aws-sdk S3 client. At a minimum you must specify `bucket`, to define the site bucket. You can find all available options in the []AWS SDK documentation](//@see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property)
*  **headers**:  Headers to add to all objects in S3. By default you will get `'Cache-Control': 'max-age=315360000, no-transform, public'`
*  **cf**: CloudFront distro id must be defined in `cf.distribution`. This will create CF invalidations for all uploaded resources. See [gulp-cloudfront-invalidate-aws-publish](https://github.com/lpender/gulp-cloudfront-invalidate-aws-publish)

## Thanks

[mgechev/angular-seed](https://github.com/mgechev/angular-seed), [gulp-awspublish](https://github.com/pgherveou/gulp-awspublish/) and [gulp-cloudfront-invalidate-aws-publish](https://github.com/lpender/gulp-cloudfront-invalidate-aws-publish)
