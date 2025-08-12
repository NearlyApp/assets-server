import { Construct } from "constructs";
import {
  LambdaIntegration,
  type IResource,
  type MethodOptions,
  type RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime, type Function } from "aws-cdk-lib/aws-lambda";
import type { Bucket } from "aws-cdk-lib/aws-s3";
import { join } from "path";

interface EndpointsProps {
  api: RestApi;
  bucket: Bucket;
}

export class Endpoints extends Construct {
  constructor(scope: Construct, id: string, props: EndpointsProps) {
    super(scope, id);

    const upload = props.api.root.addResource("upload");

    const uploadHandler = this.createLambda({
      id: "UploadHandler",
      entry: "../lambdas/upload",
      envs: {
        BUCKET_NAME: props.bucket.bucketName,
      },
    });
    props.bucket.grantWrite(uploadHandler);

    this.addIntegration({
      resource: upload,
      method: "POST",
      lambda: uploadHandler,
    });

    const idPath = props.api.root.addResource("{id}");

    const getHandler = this.createLambda({
      id: "GetHandler",
      entry: "../lambdas/get",
      envs: {
        BUCKET_NAME: props.bucket.bucketName,
      },
    });
    props.bucket.grantRead(getHandler);

    this.addIntegration({
      resource: idPath,
      method: "GET",
      lambda: getHandler,
    });

    const deleteHandler = this.createLambda({
      id: "DeleteHandler",
      entry: "../lambdas/delete",
      envs: {
        BUCKET_NAME: props.bucket.bucketName
      }
    })
    props.bucket.grantWrite(deleteHandler)

    this.addIntegration({
      resource: idPath,
      method: "DELETE",
      lambda: deleteHandler
    })
  }

  createLambda(options: {
    id: string;
    entry: string;
    envs?: Record<string, string>;
  }) {
    const func = new NodejsFunction(this, options.id, {
      entry: join(__dirname, `${options.entry}.js`),
      runtime: Runtime.NODEJS_22_X,
      environment: options.envs,
      bundling: {
        format: OutputFormat.CJS,
      },
      depsLockFilePath: join(__dirname, "../../bun.lock"),
      memorySize: 512,
    });

    return func;
  }

  addIntegration({
    resource,
    method,
    lambda,
    opts,
  }: {
    resource: IResource;
    method: string;
    lambda: Function;
    opts?: MethodOptions;
  }) {
    resource.addMethod(method, new LambdaIntegration(lambda), {
      ...opts,
      apiKeyRequired: true
    });
  }
}
