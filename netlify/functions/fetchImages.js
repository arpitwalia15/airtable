import fetch from "node-fetch";
import 'dotenv/config';

export async function handler(event, context) {
  try {
    // const baseId = process.env.AIRTABLE_BASE_ID;
    // const apiKey = process.env.AIRTABLE_PAT; // ✅ match .env

    const baseId = "appEr7aN5ctjnRYdM";
    const apiKey = "pat0n1jcAEI4sdSqx.daeb433bbb114a3e90d82b8b380b17e6f8f007426ea36aac6e15fdcc962994fb"; // ✅ match .env
    

    // fetch from Table A
    const resA = await fetch(`https://api.airtable.com/v0/${baseId}/tbllSk56KZ9TA0ioI`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const dataA = await resA.json();

    console.log("dataA",dataA);

    // fetch from Table B
    const resB = await fetch(`https://api.airtable.com/v0/${baseId}/tbl1r1HbYwHvAf9uA`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const dataB = await resB.json();

     console.log("dataA", dataA);
     
    return {
      statusCode: 200,
      body: JSON.stringify({
        tableA: dataA.records,
        tableB: dataB.records
      })
    };

  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
}



