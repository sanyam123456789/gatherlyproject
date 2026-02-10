const fs = require('fs');
require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const log = [];
function print(msg) {
    console.log(msg);
    log.push(msg);
}

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function test() {
    try {
        print('Testing S3 upload...');
        print('Bucket: ' + process.env.AWS_S3_BUCKET);
        print('Region: ' + process.env.AWS_REGION);

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: 'test/hello.txt',
            Body: 'Hello from Gatherly!',
            ContentType: 'text/plain'
        });

        await s3Client.send(command);

        const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/test/hello.txt`;
        print('\nSUCCESS!');
        print('URL: ' + url);
        print('\nTest passed! S3 is configured correctly.');

        fs.writeFileSync('test-result.txt', log.join('\n') + '\n\nSTATUS: PASS');
    } catch (error) {
        print('\nERROR: ' + error.name);
        print('Message: ' + error.message);
        fs.writeFileSync('test-result.txt', log.join('\n') + '\n\nSTATUS: FAIL\nERROR: ' + error.message);
    }
}

test();
