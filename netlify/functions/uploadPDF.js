import Airtable from "airtable";

// 🔑 Hardcode keys for now
const AIRTABLE_API_KEY = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb";
const BASE_ID = "appEr7aN5ctjnRYdM";
const TABLE_A = "tbllSk56KZ9TA0ioI";

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(BASE_ID);

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const recordId = body.recordId;
    const dummyText = body.dummy || "PDF placeholder ✅"; // just text for now

    // 🔥 Update Airtable with dummy text
    const updated = await base(TABLE_A).update([
      {
        id: recordId,
        fields: {
          "Generated PDF": dummyText
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
