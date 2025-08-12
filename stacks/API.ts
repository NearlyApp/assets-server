import { config, ALLOWED_CONTENT_TYPES } from "../config";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53targets from "aws-cdk-lib/aws-route53-targets";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { EndpointType, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Endpoints } from "../constructs/Endpoints";
import { AssetsBucket } from "../constructs/AssetsBucket";
import { App, Stack, type StackProps } from "aws-cdk-lib";

export interface APIProps extends StackProps {
  stage: string;
  recordName: string;
}

export class AssetsApi extends Stack {
  constructor(scope: App, id: string, props: APIProps) {
    super(scope, id, props);

    const domainName = `${props.recordName}.${config.hostedZone}`;
    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: config.hostedZone,
    });

    const cert = new acm.Certificate(this, "Certificate", {
      domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const api = new RestApi(this, "RestAPI", {
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: ["*"],
      },
      domainName: {
        domainName,
        certificate: cert,
      },
      endpointConfiguration: {
        types: [EndpointType.REGIONAL],
      },
      binaryMediaTypes: [
        ...ALLOWED_CONTENT_TYPES,
        // Add wildcard to handle any Accept header for binary content
        "*/*",
      ],
    });
    const apiKey = api.addApiKey("ApiKey")
    const plan = api.addUsagePlan("UsagePlan")
    plan.addApiKey(apiKey)
    plan.addApiStage({
      stage: api.deploymentStage
    })

    new route53.ARecord(this, "AliasRecord", {
      zone: hostedZone,
      recordName: props.recordName,
      target: route53.RecordTarget.fromAlias(
        new route53targets.ApiGateway(api)
      ),
    });

    const { bucket } = new AssetsBucket(this, "Bucket");

    new Endpoints(this, "Endpoints", {
      api,
      bucket,
    });
  }
}
