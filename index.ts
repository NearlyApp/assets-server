import { App } from "aws-cdk-lib";
import { environments } from "./config";
import { AssetsApi } from "./stacks/API";

const awsEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT!,
  region: process.env.CDK_DEFAULT_REGION!,
};

const app = new App();

environments.forEach((environment) => {
  new AssetsApi(app, `AssetsApi-${environment.stage}`, {
    recordName: environment.recordName,
    stage: environment.stage,
    env: awsEnv,
  });
});
