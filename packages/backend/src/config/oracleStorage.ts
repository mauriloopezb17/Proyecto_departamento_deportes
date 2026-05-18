import { S3Client } from "@aws-sdk/client-s3";

export const OCI_REGION = process.env.OCI_REGION as string;
export const OCI_NAMESPACE = process.env.OCI_NAMESPACE as string;
export const BUCKET_NAME = process.env.OCI_BUCKET_NAME as string;
export const CDN_PUBLIC_URL = process.env.CDN_PUBLIC_URL as string;

const ociEndpoint = `https://${OCI_NAMESPACE}.compat.objectstorage.${OCI_REGION}.oraclecloud.com`;

export const s3Client = new S3Client({
    region: OCI_REGION,
    endpoint: ociEndpoint,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.OCI_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.OCI_SECRET_ACCESS_KEY as string,
    },
});