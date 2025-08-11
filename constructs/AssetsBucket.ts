import { RemovalPolicy } from "aws-cdk-lib";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class AssetsBucket extends Construct {
  public bucket: Bucket;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bucket = new Bucket(this, "Assets", {
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
