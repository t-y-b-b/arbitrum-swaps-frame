import { NeynarRedash } from "../lib/driver_redash_neynar";

export async function fetchQuestions() {
  const driver = new NeynarRedash();
  console.log("getting query results");
  try {
    const resultData = await driver.getResultFromExistingQuery(569);
    const stats = resultData.data.rows; // Access the nested 'rows' which contains the data you want to insert
    return stats;
  } catch (err) {
    console.error(err);
  }
}
