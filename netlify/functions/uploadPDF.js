// netlify/functions/uploadPDF.js
const fetch = require("node-fetch");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "https://giovannis-marvelous-site-238521.webflow.io", // 👈 your Webflow domain
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
  };

  // ✅ Always handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "CORS preflight OK",
    };
  }

  try {
    const { fileBase64, records } = JSON.parse(event.body);

    if (!fileBase64 || !records) {
      throw new Error("Missing fileBase64 or records");
    }

    // 🔹 Upload to Cloudinary
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
    const AIRTABLE_API_KEY = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb";
    const BASE_ID = "appEr7aN5ctjnRYdM";
    const TABLE_A = "tbllSk56KZ9TA0ioI";


    //  const token = {
    //   Authorization: `Bearer ${AIRTABLE_API_KEY}`
    // };

    // // Fetch Table A
    // const resA = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_A}`, { token });

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
      headers,
      body: JSON.stringify({ success: true, pdfUrl }),
    };
  } catch (err) {
    console.error("Upload error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
