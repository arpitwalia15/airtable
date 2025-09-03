const Airtable = require("airtable");
const multiparty = require("multiparty");
const fs = require("fs");

exports.handler = async function (event) {
  try {
    // 🔑 Airtable credentials (hardcoded for free Netlify)
    const AIRTABLE_API_KEY = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb";
    const BASE_ID = "appEr7aN5ctjnRYdM";
    const TABLE_A = "tbllSk56KZ9TA0ioI"; // Table A

    const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(BASE_ID);

    // Parse multipart form-data (PDF + recordId)
    const form = new multiparty.Form();

    const data = await new Promise((resolve, reject) => {
      form.parse(event, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const recordId = data.fields.recordId[0]; // Airtable record ID
    const filePath = data.files.file[0].path;

    const pdfBuffer = fs.readFileSync(filePath);

    // ✅ Upload PDF into Airtable's "Generated PDF" field
    const updated = await base(TABLE_A).update(recordId, {
      "Generated PDF": [
        {
          filename: "selected-images.pdf",
          type: "application/pdf",
          url: `data:application/pdf;base64,${pdfBuffer.toString("base64")}`
        }
      ]
    });

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: true, record: updated })
    };
  } catch (err) {
    console.error("Upload error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
