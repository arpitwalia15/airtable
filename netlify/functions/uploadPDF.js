// netlify/functions/uploadPDF.js
const fetch = require("node-fetch");

exports.handler = async (event) => {
  // ✅ Handle CORS Preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: "Preflight OK",
    };
  }

  try {
    const { fileBase64, records } = JSON.parse(event.body);

    if (!fileBase64 || !records) {
      throw new Error("Missing fileBase64 or records");
    }

    // 🔹 Upload PDF to Cloudinary
    const cloudName = "dgpesr4ys";
    const uploadPreset = "unsigned_pdfs";

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: `data:application/pdf;base64,${fileBase64}`,
          upload_preset: uploadPreset,
        }),
      }
    );

    const cloudJson = await cloudRes.json();

    if (!cloudJson.secure_url) {
      throw new Error("Cloudinary upload failed: " + JSON.stringify(cloudJson));
    }

    const pdfUrl = cloudJson.secure_url;

    // 🔹 Save to Airtable
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY; // store in Netlify env
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

// ✅ CORS headers helper
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://giovannis-marvelous-site-238521.webflow.io",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
  };
}
