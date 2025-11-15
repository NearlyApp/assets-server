import { RemovalPolicy } from "aws-cdk-lib";
import {
  AccessLevel,
  Distribution,
  S3OriginAccessControl,
  Signing,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class AssetsBucket extends Construct {
  public bucket: Bucket;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bucket = new Bucket(this, "Assets", {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const oac = new S3OriginAccessControl(this, "OAC", {
      signing: Signing.SIGV4_ALWAYS,
    });

    const s3Origin = S3BucketOrigin.withOriginAccessControl(this.bucket, {
      originAccessControl: oac,
      originAccessLevels: [AccessLevel.READ],
    });

    const distribution = new Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    this.bucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        principals: [new ServicePrincipal("cloudfront.amazonaws.com")],
        resources: [this.bucket.arnForObjects("*")],
        conditions: {
          StringEquals: {
            "AWS:SourceArn": distribution.distributionArn,
          },
        },
      })
    );
  }
}
