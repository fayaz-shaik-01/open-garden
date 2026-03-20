# Sample Notion Data for Portfolio Site

Follow these steps to set up all 3 databases in Notion with rich sample data.

## Step 1: Create 3 Databases

Create 3 **full-page databases** in Notion (not inline). Name them:
1. **Portfolio Notes**
2. **Portfolio Projects** 
3. **Portfolio Bookmarks**

## Step 2: Set Up Database Columns

### Notes Database
| Column Name | Type | 
|---|---|
| Title | Title (default) |
| Content | Rich Text |
| Tags | Multi-select |
| Date | Date |
| Published | Checkbox |

### Projects Database
| Column Name | Type |
|---|---|
| Name | Title (default) |
| Excerpt | Rich Text |
| Tags | Multi-select |
| Status | Select (options: Published, Draft, Archived) |
| Cover | Files & media |
| Published Date | Date |

### Bookmarks Database
| Column Name | Type |
|---|---|
| Title | Title (default) |
| URL | URL |
| Description | Rich Text |
| Tags | Multi-select |
| Date | Date |

## Step 3: Share All 3 Databases with Your Integration

For each database: Click **⋯** → **Connections** → Add your integration.

## Step 4: Add Data

See the CSV files in this folder. Import them or manually add the entries.

For page body content (which CSVs can't include), see `page-content.md` for copy-paste content for each project page.

## Step 5: Copy Database IDs & Update .env

Each database URL looks like:
```
https://notion.so/YOUR_WORKSPACE/<DATABASE_ID>?v=...
```

Update your `.env`:
```
NOTION_API_KEY=ntn_your_key
NOTION_NOTES_DB=<notes-database-id>
NOTION_PROJECTS_DB=<projects-database-id>
NOTION_BOOKMARKS_DB=<bookmarks-database-id>
```
