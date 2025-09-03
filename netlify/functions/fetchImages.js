// import fetch from "node-fetch";
// import 'dotenv/config';

// export async function handler(event, context) {
//   try {
//     // const baseId = process.env.AIRTABLE_BASE_ID;
//     // const apiKey = process.env.AIRTABLE_PAT; // ✅ match .env

//     const baseId = "appEr7aN5ctjnRYdM";
//     const apiKey = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb"; // ✅ match .env
    

//     // fetch from Table A
//     const resA = await fetch(`https://api.airtable.com/v0/${baseId}/tbllSk56KZ9TA0ioI`, {
//       headers: { Authorization: `Bearer ${apiKey}` }
//     });
//     const dataA = await resA.json();

//     console.log("dataA",dataA);

//     // fetch from Table B
//     const resB = await fetch(`https://api.airtable.com/v0/${baseId}/tbl1r1HbYwHvAf9uA`, {
//       headers: { Authorization: `Bearer ${apiKey}` }
//     });
//     const dataB = await resB.json();

//      console.log("dataA", dataA);
     
//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         tableA: dataA.records,
//         tableB: dataB.records
//       })
//     };

//   } catch (err) {
//     return { statusCode: 500, body: err.toString() };
//   }
// }

import fetch from "node-fetch";

export const handler = async function (event) {
  try {
    const AIRTABLE_API_KEY = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb";
    const BASE_ID = "appEr7aN5ctjnRYdM";
    const TABLE_A = "tbllSk56KZ9TA0ioI";
    const TABLE_B = "tbl1r1HbYwHvAf9uA";

    const headers = {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    };

    // 🚀 If request is POST → save PDF in Airtable
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);

      const { recordId, pdfUrl } = body;

      if (!recordId || !pdfUrl) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "recordId and pdfUrl are required" })
        };
      }

      // Update Airtable with generated PDF
      const updateRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_A}/${recordId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          fields: {
            "Generated PDF": [
              {
                url: pdfUrl
              }
            ]
          }
        })
      });

      const updateData = await updateRes.json();

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(updateData)
      };
    }

    // 🚀 Otherwise GET → fetch images from Airtable (your old code)
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

  } catch (err) {
    console.error("Error handling Airtable request:", err);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Server error" })
    };
  }
};

