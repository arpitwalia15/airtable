// netlify/functions/uploadPDF.js
// import fetch from "node-fetch";
// import FormData from "form-data";

export const handler = async (event) => {
  try {
    const AIRTABLE_API_KEY = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb";
    const BASE_ID = "appEr7aN5ctjnRYdM";
    const TABLE_A = "tbllSk56KZ9TA0ioI"; // your table
    const { recordId } = event.queryStringParameters;

    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Parse file from multipart form-data
    const boundary = event.headers["content-type"].split("boundary=")[1];
    const parts = event.body.split(`--${boundary}`);
    // (for production, use a lib like busboy for parsing)

    // Upload PDF file to Airtable by URL
    // Airtable requires an external file URL
    // Option 1: first upload to Cloudinary/S3/Netlify Large Media → get public URL
    // Option 2: convert to base64 and use an upload API

    // For demo: we'll pretend we already have a public URL
    const pdfUrl = "https://example.com/selected-images.pdf";

    const updateRes = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_A}/${recordId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            "Generated PDF": [{ url: pdfUrl }],
          },
        }),
      }
    );

    const data = await updateRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, airtable: data }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to upload PDF" }),
    };
  }
};
