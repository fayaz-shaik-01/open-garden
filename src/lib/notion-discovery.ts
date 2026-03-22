import { Client } from "@notionhq/client";
import { DatabaseInfo, DatabaseItem, DatabaseType, WorkspaceType, ResolvedRelation } from "@/types/database";

// Dynamic workspace support - automatically detects all workspaces
function getAvailableWorkspaces(): string[] {
  return Object.entries(process.env)
    .filter(([key, value]) => 
      key.startsWith('NOTION_') && 
      key.endsWith('_API_KEY') && 
      value && 
      key !== 'NOTION_API_KEY' // Exclude primary key
    )
    .map(([key]) => 
      key.replace('NOTION_', '').replace('_API_KEY', '').toLowerCase()
    );
}

function getWorkspaceClient(workspace: string): Client {
  const apiKey = process.env[`NOTION_${workspace.toUpperCase()}_API_KEY`] || process.env.NOTION_API_KEY;
  return new Client({ auth: apiKey });
}

function inferWorkspaceFromTitle(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes("gate ec") || lowerTitle.startsWith("gate ec")) {
    return "gate-ec";
  }
  
  if (lowerTitle.includes("ml") || lowerTitle.includes("machine learning")) {
    return "ml";
  }
  
  return "personal";
}

// ─── Database Discovery ───────────────────────────────────────────────────────

export async function getAllDatabases(): Promise<DatabaseInfo[]> {
  const allDatabases: DatabaseInfo[] = [];
  
  // Automatically detect all available workspaces
  const workspaces = getAvailableWorkspaces();
  
  console.log("🔍 Starting database discovery for auto-detected workspaces:", workspaces);
  
  for (const workspace of workspaces) {
    try {
      const client = getWorkspaceClient(workspace);
      console.log(`📡 Fetching databases for workspace: ${workspace}`);
      
      const response = await client.search({ 
        filter: { property: "object", value: "database" }, 
        page_size: 100 
      });
      
      console.log(`📊 Found ${response.results.length} databases in ${workspace}`);
      
      // For each database found, retrieve full details to get proper titles
      const databases = [];
      for (const page of response.results as any[]) {
        try {
          console.log(`🔍 Retrieving full details for database: ${page.id}`);
          
          // Use retrieve API to get complete database information
          const dbDetails = await client.databases.retrieve({ database_id: page.id });
          
          // Extract title from the retrieved database details
          let title = "Untitled";
          
          // Database title is at the TOP LEVEL, not in properties
          if ((dbDetails as any).title?.length) {
            title = (dbDetails as any).title[0].plain_text;
            console.log(`   ✅ Found title via top-level db.title: "${title}"`);
          } else {
            console.log(`   ❌ No title found in retrieve API, using "Untitled"`);
            console.log(`   🔍 dbDetails keys:`, Object.keys(dbDetails));
            console.log(`   🔍 dbDetails.title:`, (dbDetails as any).title);
          }
          
          // Description is also at top level
          const description = (dbDetails as any).description?.[0]?.plain_text || "";
          
          // Properties for type inference (still needed)
          const dbProps = dbDetails.properties as any;
          
          console.log(`🗄️  Final Database: "${title}" (ID: ${page.id})`);
          
          databases.push({
            id: page.id,
            title,
            description,
            properties: dbProps || {},
            created_time: (dbDetails as any).created_time || page.created_time,
            last_edited_time: (dbDetails as any).last_edited_time || page.last_edited_time,
            url: (dbDetails as any).url || page.url,
            type: inferDatabaseType(title, dbProps),
            workspace: workspace,
          });
          
        } catch (retrieveError) {
          console.log(`❌ Failed to retrieve details for database ${page.id}:`, retrieveError);
          // Fall back to basic info if retrieve fails
          databases.push({
            id: page.id,
            title: "Untitled",
            description: "",
            properties: page.properties || {},
            created_time: page.created_time,
            last_edited_time: page.last_edited_time,
            url: page.url,
            type: "unknown" as DatabaseType,
            workspace: workspace,
          });
        }
      }
      
      allDatabases.push(...databases);
    } catch (error) {
      console.log(`❌ Failed to fetch databases for workspace ${workspace}:`, error);
      // Continue with other workspaces if one fails
    }
  }
  
  // Fallback to primary workspace if no databases found
  if (allDatabases.length === 0) {
    console.log("🔄 No databases found from workspaces, trying primary fallback...");
    try {
      const client = new Client({ auth: process.env.NOTION_API_KEY });
      const response = await client.search({ 
        filter: { property: "object", value: "database" }, 
        page_size: 100 
      });
      
      console.log(`📊 Found ${response.results.length} databases in primary fallback`);
      
      const databases = (response.results as any[]).map((page) => {
        // Debug: Check the structure of the database object
        console.log(`🔍 Database: ${page.id}`);
        console.log(`   Object keys:`, Object.keys(page));
        console.log(`   Properties keys:`, page.properties ? Object.keys(page.properties) : 'No properties');
        
        // For databases from search API, the title is at the TOP LEVEL
        let title = "Untitled";
        
        // Method 1: Check top-level title array (correct way for database objects)
        if (page.title && Array.isArray(page.title) && page.title.length > 0) {
          title = page.title[0].plain_text;
          console.log(`   ✅ Found title via top-level page.title array: "${title}"`);
        }
        // Method 2: Check direct title string (fallback)
        else if (page.title && typeof page.title === 'string' && page.title.trim()) {
          title = page.title.trim();
          console.log(`   ✅ Found title via direct page.title string: "${title}"`);
        }
        // Method 3: Try to find any title property in properties (columns, not database name)
        else {
          let found = false;
          for (const [propKey, propValue] of Object.entries(page.properties || {})) {
            if ((propValue as any).title?.length) {
              title = (propValue as any).title[0].plain_text;
              console.log(`   ✅ Found title via property "${propKey}": "${title}"`);
              found = true;
              break;
            }
            if ((propValue as any).rich_text?.length) {
              title = (propValue as any).rich_text[0].plain_text;
              console.log(`   ✅ Found title via rich_text property "${propKey}": "${title}"`);
              found = true;
              break;
            }
          }
          if (!found) {
            console.log(`   ❌ No title found, using "Untitled"`);
            console.log(`   🔍 page.title:`, page.title);
          }
        }
        
        // Ensure title is a string
        if (typeof title !== 'string') {
          title = "Untitled";
        }
        
        const description = (page as any).description?.[0]?.plain_text || "";
        
        return {
          id: page.id,
          title,
          description,
          properties: page.properties || {},
          created_time: page.created_time,
          last_edited_time: page.last_edited_time,
          url: page.url,
          type: inferDatabaseType(title, page.properties),
          workspace: inferWorkspaceFromTitle(title),
        };
      });
      
      allDatabases.push(...databases);
    } catch (error) {
      console.error("❌ Failed to fetch databases from primary workspace:", error);
    }
  }
  
  console.log(`✅ Total databases discovered: ${allDatabases.length}`);
  console.log("📋 Database summary:", allDatabases.map(db => ({
    title: db.title,
    workspace: db.workspace,
    type: db.type
  })));
  
  return allDatabases.sort((a, b) => a.title.localeCompare(b.title));
}

// ─── Universal Title Extraction ──────────────────────────────────────────────

// Every Notion page has exactly one property with type "title". This finds it.
function extractPageTitle(properties: Record<string, any>): string {
  for (const [, propValue] of Object.entries(properties || {})) {
    if (propValue?.type === "title" && propValue?.title?.length > 0) {
      return propValue.title.map((t: any) => t.plain_text).join("");
    }
  }
  return "Untitled";
}

// ─── Client for a specific database ─────────────────────────────────────────

// Cache for workspace client selection
const dbWorkspaceCache: Record<string, string> = {};

// Cache for database info (5 minutes TTL)
const databaseInfoCache = new Map<string, { data: DatabaseInfo; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache for page titles to avoid repeated API calls
const pageTitleCache = new Map<string, { title: string; databaseId?: string; timestamp: number }>();
const TITLE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function getClientForDatabase(databaseId: string): Promise<Client> {
  // Check cache first
  const cachedWorkspace = dbWorkspaceCache[databaseId];
  if (cachedWorkspace) {
    return getWorkspaceClient(cachedWorkspace);
  }
  
  // Try each workspace client to find which one owns this database
  const workspaces = getAvailableWorkspaces();
  for (const ws of workspaces) {
    try {
      const client = getWorkspaceClient(ws);
      await client.databases.retrieve({ database_id: databaseId });
      // Success — cache and return
      dbWorkspaceCache[databaseId] = ws;
      return client;
    } catch {
      // This workspace doesn't have access, try next
    }
  }
  
  // Fallback to primary
  return new Client({ auth: process.env.NOTION_API_KEY });
}

// ─── Relation Resolution ─────────────────────────────────────────────────────

async function resolveRelations(properties: Record<string, any>, client: Client): Promise<ResolvedRelation[]> {
  const relations: ResolvedRelation[] = [];
  const allPageIds = new Set<string>();
  const relationMap = new Map<string, string>(); // pageId -> propertyName
  
  // Collect all relation page IDs first
  for (const [propName, propValue] of Object.entries(properties || {})) {
    if (propValue?.type === "relation" && propValue?.relation?.length > 0) {
      for (const rel of propValue.relation) {
        allPageIds.add(rel.id);
        relationMap.set(rel.id, propName);
      }
    }
  }
  
  if (allPageIds.size === 0) return relations;
  
  // Batch fetch all pages at once
  const pagePromises = Array.from(allPageIds).map(async (pageId) => {
    // Check cache first
    const cached = pageTitleCache.get(pageId);
    if (cached && Date.now() - cached.timestamp < TITLE_CACHE_TTL) {
      return { id: pageId, title: cached.title, databaseId: cached.databaseId };
    }
    
    try {
      const relatedPage = await client.pages.retrieve({ page_id: pageId }) as any;
      const title = extractPageTitle(relatedPage.properties || {});
      const parentDbId = relatedPage.parent?.database_id || undefined;
      
      // Cache the title and databaseId
      pageTitleCache.set(pageId, { title, databaseId: parentDbId, timestamp: Date.now() });
      
      return { id: pageId, title, databaseId: parentDbId };
    } catch {
      const title = "Untitled";
      pageTitleCache.set(pageId, { title, timestamp: Date.now() });
      return { id: pageId, title, databaseId: undefined };
    }
  });
  
  // Wait for all page fetches to complete
  const pageResults = await Promise.all(pagePromises);
  
  // Group results by property name
  const groupedResults = new Map<string, { id: string; title: string; databaseId?: string }[]>();
  
  for (const pageResult of pageResults) {
    const propertyName = relationMap.get(pageResult.id);
    if (propertyName) {
      if (!groupedResults.has(propertyName)) {
        groupedResults.set(propertyName, []);
      }
      groupedResults.get(propertyName)!.push(pageResult);
    }
  }
  
  // Convert to relations array
  groupedResults.forEach((items, propName) => {
    relations.push({ propertyName: propName, items });
  });
  
  return relations;
}

// ─── Database CRUD ───────────────────────────────────────────────────────────

export async function getDatabaseById(id: string, workspace?: string): Promise<DatabaseInfo | null> {
  // Check cache first
  const cached = databaseInfoCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const client = workspace ? getWorkspaceClient(workspace) : await getClientForDatabase(id);
    const db = await client.databases.retrieve({ database_id: id });
    
    // Database title is at TOP LEVEL, not in properties
    const title = (db as any).title?.[0]?.plain_text || "Untitled";
    const description = (db as any).description?.[0]?.plain_text || "";
    
    // Cache the workspace mapping
    const ws = workspace || dbWorkspaceCache[id] || inferWorkspaceFromTitle(title);
    dbWorkspaceCache[id] = ws;
    
    const result = {
      id: (db as any).id,
      title,
      description,
      properties: (db as any).properties || {},
      created_time: (db as any).created_time,
      last_edited_time: (db as any).last_edited_time,
      url: (db as any).url,
      type: inferDatabaseType(title, (db as any).properties),
      workspace: ws,
    };

    // Cache the result
    databaseInfoCache.set(id, { data: result, timestamp: Date.now() });
    
    return result;
  } catch (error) {
    console.error("Failed to fetch database:", error);
    return null;
  }
}

export async function getDatabaseItems(
  databaseId: string, 
  pageSize: number = 50,
  withRelations: boolean = false
): Promise<DatabaseItem[]> {
  try {
    const client = await getClientForDatabase(databaseId);
    
    const response = await client.databases.query({
      database_id: databaseId,
      page_size: pageSize,
    });

    // Get the database info for correct type and workspace (cached)
    const databaseInfo = await getDatabaseById(databaseId);
    const databaseType = databaseInfo?.type || "unknown";
    const workspace = databaseInfo?.workspace || "personal";

    // Process items in parallel if relations are needed
    const itemPromises = (response.results as any[]).map(async (page) => {
      const title = extractPageTitle(page.properties || {});
      
      let resolvedRelations: ResolvedRelation[] | undefined;
      if (withRelations) {
        resolvedRelations = await resolveRelations(page.properties || {}, client);
      }
      
      return {
        id: page.id,
        title,
        properties: page.properties || {},
        created_time: page.created_time,
        last_edited_time: page.last_edited_time,
        url: page.url,
        databaseType,
        databaseId,
        workspace,
        resolvedRelations,
      };
    });

    const items = await Promise.all(itemPromises);

    return items;
  } catch (error) {
    console.error("Failed to fetch database items:", error);
    return [];
  }
}

export async function getDatabaseItemById(
  databaseId: string, 
  itemId: string,
  withRelations: boolean = false,
  withContent: boolean = true
): Promise<DatabaseItem | null> {
  try {
    const client = await getClientForDatabase(databaseId);
    
    // Get database info first (cached)
    const databaseInfo = await getDatabaseById(databaseId);
    const databaseType = databaseInfo?.type || "unknown";
    const workspace = databaseInfo?.workspace || "personal";
    
    // Fetch page and content in parallel
    const [page, content] = await Promise.allSettled([
      client.pages.retrieve({ page_id: itemId }) as Promise<any>,
      withContent ? fetchPageContent(client, itemId) : Promise.resolve([])
    ]);
    
    if (page.status === 'rejected') {
      throw page.reason;
    }
    
    const pageData = page.value;
    const contentData = content.status === 'fulfilled' ? content.value : [];
    
    const title = extractPageTitle(pageData.properties || {});
    
    let resolvedRelations: ResolvedRelation[] | undefined;
    if (withRelations) {
      resolvedRelations = await resolveRelations(pageData.properties || {}, client);
    }
    
    return {
      id: pageData.id,
      title,
      properties: pageData.properties || {},
      created_time: pageData.created_time,
      last_edited_time: pageData.last_edited_time,
      url: pageData.url,
      databaseType,
      databaseId,
      workspace,
      resolvedRelations,
      content: contentData,
    };
  } catch (error) {
    console.error("Failed to fetch database item:", error);
    return null;
  }
}

// Helper function to fetch page content with children
async function fetchPageContent(client: Client, pageId: string): Promise<any[]> {
  try {
    const blocks = await client.blocks.children.list({ block_id: pageId });
    const content = blocks.results;
    
    // Fetch children for blocks that have them (in parallel)
    const childBlockPromises = content
      .filter((block: any) => block.has_children)
      .map(async (block: any) => {
        try {
          const childBlocks = await client.blocks.children.list({ block_id: block.id });
          return { blockId: block.id, children: childBlocks.results };
        } catch {
          return { blockId: block.id, children: [] };
        }
      });
    
    const childResults = await Promise.all(childBlockPromises);
    
    // Attach children to their parent blocks
    childResults.forEach(({ blockId, children }) => {
      const parentBlock = content.find((block: any) => block.id === blockId);
      if (parentBlock) {
        (parentBlock as any).children = children;
      }
    });
    
    return content;
  } catch (error) {
    console.warn("Could not fetch page content blocks:", error);
    return [];
  }
}

// ─── Type Inference ───────────────────────────────────────────────────────────

export function inferDatabaseType(title: string, properties: Record<string, any>): DatabaseType {
  const lowerTitle = title.toLowerCase();
  
  // Check for specific database type patterns
  if (lowerTitle.includes("subjects") || lowerTitle.includes("subject")) {
    return "subjects";
  }
  
  if (lowerTitle.includes("pyqs") || lowerTitle.includes("previous year") || lowerTitle.includes("questions")) {
    return "solutions";
  }
  
  if (lowerTitle.includes("topics") || lowerTitle.includes("topic")) {
    return "resources";
  }
  
  if (lowerTitle.includes("papers") || lowerTitle.includes("paper") || lowerTitle.includes("research")) {
    return "papers";
  }
  
  if (lowerTitle.includes("solutions") || lowerTitle.includes("solution")) {
    return "solutions";
  }
  
  if (lowerTitle.includes("resources") || lowerTitle.includes("resource")) {
    return "resources";
  }
  
  if (lowerTitle.includes("projects") || lowerTitle.includes("project")) {
    return "projects";
  }
  
  if (lowerTitle.includes("bookmarks") || lowerTitle.includes("bookmark") || lowerTitle.includes("links")) {
    return "bookmarks";
  }
  
  if (lowerTitle.includes("notes") || lowerTitle.includes("note")) {
    return "notes";
  }
  
  // Check property patterns for more accurate detection
  const propertyNames = Object.keys(properties).map(k => k.toLowerCase());
  
  if (propertyNames.includes("description") && propertyNames.includes("stack")) {
    return "projects";
  }
  
  if (propertyNames.includes("url") && propertyNames.includes("tags")) {
    return "bookmarks";
  }
  
  if (propertyNames.includes("content") || propertyNames.includes("body")) {
    return "notes";
  }
  
  // Special detection based on column names from your exports
  if (propertyNames.includes("weightage") && propertyNames.includes("priority")) {
    return "subjects";  // Subjects database has Weightage, Priority columns
  }
  
  if (propertyNames.includes("question") && propertyNames.includes("difficulty")) {
    return "solutions";  // PYQs database has Question, Difficulty columns
  }
  
  return "unknown";
}
