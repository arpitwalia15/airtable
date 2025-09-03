import Airtable from "airtable";

const AIRTABLE_API_KEY = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb";
const BASE_ID = "appEr7aN5ctjnRYdM";
const TABLE_A = "tbllSk56KZ9TA0ioI";
const TABLE_B = "tbl1r1HbYwHvAf9uA";

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(BASE_ID);

export async function handler(event) {
  try {
    // ✅ GET request: fetch and merge images
    if (event.httpMethod === "GET") {
      const headers = { Authorization: `Bearer ${AIRTABLE_API_KEY}` };

      const resA = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_A}`, { headers });
      const dataA = await resA.json();

      const resB = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_B}`, { headers });
      const dataB = await resB.json();

      const merged = [...(dataA.records || []), ...(dataB.records || [])];

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(merged)
      };
    }

    // ✅ POST request: upload PDF to Airtable
    if (event.httpMethod === "POST") {
      if (!event.body) throw new Error("No request body");

      const { recordId, pdfUrl } = JSON.parse(event.body);
      if (!recordId) throw new Error("No recordId provided");
      if (!pdfUrl) throw new Error("No pdfUrl provided");

      const updated = await base(TABLE_A).update([
        { id: recordId, fields: { "Generated PDF": [{ url: pdfUrl }] } }
      ]);

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: true, updated })
      };
    }

    // If neither GET nor POST
    return { statusCode: 400, body: "Unsupported HTTP method" };

  } catch (err) {
    console.error("Error in combined function:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
}
