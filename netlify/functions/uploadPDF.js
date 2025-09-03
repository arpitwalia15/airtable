import Airtable from "airtable";

// Hardcoded keys for now (use environment variables in production)
const AIRTABLE_API_KEY = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb";
const BASE_ID = "appEr7aN5ctjnRYdM";
const TABLE_A = "tbllSk56KZ9TA0ioI";

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(BASE_ID);

export async function handler(event) {
  try {
    console.log("Request received:", event.body);

    if (!event.body) throw new Error("No request body");

    const body = JSON.parse(event.body);
    const recordId = body.recordId;
    if (!recordId) throw new Error("No recordId provided");

    // Use dummy PDF URL if none provided
    const pdfUrl = body.pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    if (!pdfUrl) throw new Error("No PDF URL provided");

    console.log("Updating record:", recordId, "with PDF URL:", pdfUrl);

    // Update Airtable with attachment
    const updated = await base(TABLE_A).update([
      {
        id: recordId,
        fields: {
          "Generated PDF": [{ url: pdfUrl }]
        }
      }
    ]);

    console.log("Airtable update successful:", updated);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, updated })
    };

  } catch (err) {
    console.error("Upload error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
