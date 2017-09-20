"use strict";

var gulp = require("gulp");
var AWS = require("aws-sdk");
var gutil = require("gulp-util");
var async = require("async");
var s3_dir = require("s3");
var fs = require("fs");
var shell = require('gulp-shell');

var environment = process.env.ENVIRONMENT || "dev";
var appName = process.env.appName;
var AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
var AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
var AWS_PEM_KEY = process.env.AWS_PEM_KEY || "";
var AWS_USER = process.env.AWS_USER || "";
var AWS_IP = process.env.AWS_IP || "";
var AWS_DESTINATION_PATH = process.env.AWS_DESTINATION_PATH || "";

if (environment == "production") {
  appName = process.env.appName_prod;
  AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID_PROD || "";
  AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY_PROD || "";
}

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: "us-east-1"
});

gulp.task("deploy-s3", function(done) {
  var s3 = new AWS.S3();
  var bucketName = appName + "-" + environment;
  var client = s3_dir.createClient({
    s3Options: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
  });

  var params = {
    localDir: "dist/",
    deleteRemoved: true,
    s3Params: {
      Bucket: bucketName
    }
  };

  var policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "Allow Public Access to All Objects",
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: "arn:aws:s3:::" + bucketName + "/*"
      }
    ]
  };
  s3.createBucket(
    {
      Bucket: bucketName
    },
    function(err) {
      if (err) {
        throw new gutil.PluginError("deploy", err);
      }
      var uploader = client.uploadDir(params);
      uploader.on("error", function(err) {
        console.error("unable to sync:", err.stack);
      });
      uploader.on("progress", function() {
        console.log(
          "progress",
          uploader.progressAmount,
          uploader.progressTotal
        );
      });
      uploader.on("end", function() {
        console.log("done uploading");
      });
      async.parallel(
        [
          s3.upload.bind(s3, {
            Bucket: bucketName,
            Key: "home/index.html",
            Body: fs.createReadStream("dist/home/index.html"),
            ContentType: "text/html"
          }),
          s3.putBucketPolicy.bind(s3, {
            Bucket: bucketName,
            Policy: JSON.stringify(policy)
          }),
          s3.putBucketWebsite.bind(s3, {
            Bucket: bucketName,
            WebsiteConfiguration: {
              IndexDocument: {
                Suffix: "home\index.html"
              },
              ErrorDocument: {
                Key: "home\index.html"
              }
            }
          })
        ],
        function(err) {
          if (err) {
            throw new gutil.PluginError("deploy", err);
          }
          done();
        }
      );
    }
  );
});

gulp.task('scp-ec2', shell.task([
	'sudo scp -i ' + AWS_PEM_KEY + ' -r ./dist/* ' + AWS_USER + '@' + AWS_IP + ':' + AWS_DESTINATION_PATH
]));