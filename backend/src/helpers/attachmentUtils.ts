import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const s3BucketNm = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = Number(process.env.SINGED_URL_EXPIRATION)

export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = s3BucketNm
    ) { }

    getAttachmentUrl(id: string) {
        return `https://${this.bucketName}.s3.amazonaws.com/${id}`
    }

    getUploadUrl(id: string): string {
        const url = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: id,
            Expires: urlExpiration
        })

        return url as string
    }
}