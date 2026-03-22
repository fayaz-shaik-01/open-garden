// Script to discover all Notion databases accessible to the integration
async function main() {
  const { Client } = await import("@notionhq/client");

  const notion = new Client({
    auth: "ntn_j26397368893WIQcF5VTBELK0voGg3qWdU8fWBVUzsO1fK",
  });

  try {
    const response = await notion.search({
      filter: { value: "database", property: "object" },
    });

    console.log(`Found ${response.results.length} database(s):\n`);

    for (const db of response.results) {
      const title = db.title?.map((t) => t.plain_text).join("") || "Untitled";
      console.log(`=== ${title} ===`);
      console.log(`  ID: ${db.id}`);
      console.log(`  Created: ${db.created_time}`);
      console.log(`  Last edited: ${db.last_edited_time}`);
      console.log(`  Properties:`);

      for (const [name, prop] of Object.entries(db.properties)) {
        console.log(`    - ${name}: ${prop.type}`);
      }
      console.log("");
    }

    // Fetch a sample of entries from each database
    for (const db of response.results) {
      const title = db.title?.map((t) => t.plain_text).join("") || "Untitled";
      console.log(`\n--- Sample entries from "${title}" ---`);
      try {
        const entries = await notion.databases.query({
          database_id: db.id,
          page_size: 3,
        });
        console.log(`  Total results in sample: ${entries.results.length}`);
        for (const entry of entries.results) {
          console.log(`\n  Entry ID: ${entry.id}`);
          for (const [name, prop] of Object.entries(entry.properties)) {
            let value = "";
            switch (prop.type) {
              case "title":
                value = prop.title?.map((t) => t.plain_text).join("") || "";
                break;
              case "rich_text":
                value = prop.rich_text?.map((t) => t.plain_text).join("") || "";
                break;
              case "multi_select":
                value = prop.multi_select?.map((s) => s.name).join(", ") || "";
                break;
              case "select":
                value = prop.select?.name || "";
                break;
              case "url":
                value = prop.url || "";
                break;
              case "date":
                value = prop.date?.start || "";
                break;
              case "checkbox":
                value = String(prop.checkbox);
                break;
              case "number":
                value = String(prop.number ?? "");
                break;
              case "files":
                value =
                  prop.files
                    ?.map(
                      (f) =>
                        f.external?.url || f.file?.url || f.name || ""
                    )
                    .join(", ") || "";
                break;
              case "relation":
                value = prop.relation?.map((r) => r.id).join(", ") || "";
                break;
              case "status":
                value = prop.status?.name || "";
                break;
              default:
                value = `[${prop.type}]`;
            }
            if (value) console.log(`    ${name}: ${value}`);
          }
        }
      } catch (err) {
        console.log(`  Error querying: ${err.message}`);
      }
      console.log("");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
