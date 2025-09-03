import Airtable from "airtable";

// Hardcode keys for now
const AIRTABLE_API_KEY = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb";
const BASE_ID = "appEr7aN5ctjnRYdM";
const TABLE_A = "tbllSk56KZ9TA0ioI";

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(BASE_ID);

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const recordId = body.recordId;
    
    // ✅ Use a dummy PDF URL for testing
    const pdfUrl = body.pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

    // Update Airtable with attachment
    const updated = await base(TABLE_A).update([
      {
        id: recordId,
        fields: {
          "Generated PDF": [
            { url: pdfUrl }
          ]
        }
      }
    ]);

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
