// netlify/functions/uploadPDF.js
const fetch = require("node-fetch");
const FormData = require("form-data");

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: "Preflight OK",
    };
  }

  try {
    const body = JSON.parse(event.body); // Webflow must send JSON
    const { fileBase64, records } = body;

    if (!fileBase64) {
      throw new Error("No file provided");
    }

    // Convert base64 -> Buffer
    const fileBuffer = Buffer.from(fileBase64, "base64");

    // Upload to Cloudinary
    const cloudName = "dgpesr4ys";
    const uploadPreset = "unsigned_pdfs";

    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename: "upload.pdf",
      contentType: "application/pdf",
    });
    formData.append("upload_preset", uploadPreset);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: "POST", body: formData }
    );

    const cloudJson = await cloudRes.json();
    if (!cloudJson.secure_url) {
      throw new Error("Cloudinary error: " + JSON.stringify(cloudJson));
    }

    const pdfUrl = cloudJson.secure_url;

    // Save link to Airtable
    const AIRTABLE_API_KEY = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb"; // set in Netlify
    const BASE_ID = "appEr7aN5ctjnRYdM";
    const TABLE_A = "tbllSk56KZ9TA0ioI";

    for (let recordId of records) {
      await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_A}/${recordId}`, {
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
      });
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ success: true, pdfUrl }),
    };
  } catch (err) {
    console.error("Upload error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://giovannis-marvelous-site-238521.webflow.io",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
  };
}
