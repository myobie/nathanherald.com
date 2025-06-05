# created this user in the UI with programmatic access and zero permissions
# and then ran $ ./import aws_iam_user.font_bucketeer font_bucketeer
resource "aws_iam_user" "font_bucketeer" {
  name = "font_bucketeer"
}

resource "aws_s3_bucket" "font_bucket" {
  bucket = "nathanheraldcom-font-bucket"
  acl    = "private"
}

resource "aws_s3_bucket_policy" "font_bucket_policy" {
  bucket = aws_s3_bucket.font_bucket.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "${aws_iam_user.font_bucketeer.arn}"
      },
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "${aws_s3_bucket.font_bucket.arn}/*"
      ]
    }
  ]
}
EOF
}
