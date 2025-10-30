const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

// R2 configuration
const r2Client = new S3Client({
  region: "auto",
  endpoint: "https://3a17adac876a8809f183c80901c2ca3f.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "d356cad9b3def9783d747ec9cd736661",
    secretAccessKey: "410984eb3ecff6290f848a9b5f3d16b53f6665f7a371aa434937e2e31421cff5",
  },
});

async function testR2Upload() {
  try {
    console.log("Testing R2 upload...");
    
    // Create a test file
    const testContent = "Hello from Taja.Shop R2 test!";
    const testBuffer = Buffer.from(testContent);
    
    const command = new PutObjectCommand({
      Bucket: "tajaapp",
      Key: "test/hello.txt",
      Body: testBuffer,
      ContentType: "text/plain",
    });
    
    const result = await r2Client.send(command);
    console.log("✅ Upload successful!");
    console.log("Result:", result);
    
    // Test URL
    const publicUrl = "https://pub-1bc01021a631452885c83bc1cc30d706.r2.dev/test/hello.txt";
    console.log("Public URL:", publicUrl);
    
  } catch (error) {
    console.error("❌ Upload failed:", error);
  }
}

testR2Upload();

