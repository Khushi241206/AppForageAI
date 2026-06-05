import Groq from "groq-sdk";
import { sanitizeConfig } from "./sanitizer";
import { AppConfig, SanitizeResult } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert full-stack engineer and UI/UX designer.
Your ONLY task is to output a single valid JSON object — no markdown, no backticks, no explanation.

Generate a RICH, REALISTIC app configuration for the described application.

The JSON must follow this structure exactly:

{
  "name": "App Name",
  "description": "One-sentence description",
  "theme": { "primaryColor": "#hex", "accentColor": "#hex" },
  "pages": [
    {
      "id": "page_1",
      "name": "Dashboard",
      "icon": "🏠",
      "components": [ /* array of component objects */ ]
    }
  ],
  "navigation": [
    { "label": "Dashboard", "path": "/", "icon": "🏠" }
  ]
}

COMPONENT OBJECTS — pick type carefully:

STATS component (KPI cards):
{ "id": "stats_1", "type": "stats", "title": "Overview", "stats": [
  { "label": "Total Users", "value": "12,450", "change": "+8.2%", "trend": "up", "icon": "👤" },
  { "label": "Revenue", "value": "$48,230", "change": "+12.5%", "trend": "up", "icon": "💰" },
  { "label": "Active Orders", "value": "284", "change": "-3.1%", "trend": "down", "icon": "📦" },
  { "label": "Satisfaction", "value": "94.2%", "change": "+0.5%", "trend": "up", "icon": "⭐" }
]}

FORM component:
{ "id": "form_1", "type": "form", "title": "Add New Record", "submitLabel": "Save",
  "fields": [
    { "id": "f1", "name": "name", "label": "Full Name", "type": "text", "required": true, "placeholder": "John Doe" },
    { "id": "f2", "name": "email", "label": "Email", "type": "email", "required": true },
    { "id": "f3", "name": "role", "label": "Role", "type": "select", "options": [{"label":"Admin","value":"admin"},{"label":"User","value":"user"}] },
    { "id": "f4", "name": "notes", "label": "Notes", "type": "textarea" },
    { "id": "f5", "name": "active", "label": "Active Account", "type": "toggle" }
  ]
}

TABLE component:
{ "id": "table_1", "type": "table", "title": "Records", "searchable": true, "pagination": true,
  "columns": [
    { "id": "c1", "key": "name", "label": "Name", "type": "text", "sortable": true },
    { "id": "c2", "key": "email", "label": "Email", "type": "text" },
    { "id": "c3", "key": "status", "label": "Status", "type": "badge", "sortable": true },
    { "id": "c4", "key": "date", "label": "Date", "type": "date", "sortable": true },
    { "id": "c5", "key": "amount", "label": "Amount", "type": "number", "sortable": true }
  ],
  "data": [
    { "name": "Alice Johnson", "email": "alice@example.com", "status": "Active", "date": "2024-03-15", "amount": 1250 },
    { "name": "Bob Smith", "email": "bob@example.com", "status": "Pending", "date": "2024-03-14", "amount": 890 },
    { "name": "Carol White", "email": "carol@example.com", "status": "Inactive", "date": "2024-03-13", "amount": 2100 },
    { "name": "David Lee", "email": "david@example.com", "status": "Active", "date": "2024-03-12", "amount": 450 },
    { "name": "Eva Martinez", "email": "eva@example.com", "status": "Active", "date": "2024-03-11", "amount": 3200 },
    { "name": "Frank Brown", "email": "frank@example.com", "status": "Pending", "date": "2024-03-10", "amount": 780 },
    { "name": "Grace Kim", "email": "grace@example.com", "status": "Active", "date": "2024-03-09", "amount": 1560 },
    { "name": "Henry Davis", "email": "henry@example.com", "status": "Inactive", "date": "2024-03-08", "amount": 920 }
  ]
}

CHART component:
{ "id": "chart_1", "type": "chart", "title": "Monthly Revenue",
  "chart": { "type": "bar", "dataKey": "revenue", "xAxis": "month",
    "data": [
      {"month":"Jan","revenue":42000}, {"month":"Feb","revenue":48000},
      {"month":"Mar","revenue":51000}, {"month":"Apr","revenue":46000},
      {"month":"May","revenue":59000}, {"month":"Jun","revenue":63000}
    ]
  }
}

KANBAN component:
{ "id": "kanban_1", "type": "kanban", "title": "Sprint Board",
  "kanbanColumns": [
    { "id": "todo", "title": "To Do", "color": "#ec4899",
      "items": [
        {"id":"t1","title":"Design login page","description":"Create mockups"},
        {"id":"t2","title":"API documentation"}
      ]
    },
    { "id": "inprog", "title": "In Progress", "color": "#a855f7",
      "items": [
        {"id":"t3","title":"Implement auth","description":"JWT + refresh tokens"}
      ]
    },
    { "id": "done", "title": "Done", "color": "#22c55e",
      "items": [
        {"id":"t4","title":"Setup project structure"},
        {"id":"t5","title":"Database schema design"}
      ]
    }
  ]
}

TIMELINE component:
{ "id": "tl_1", "type": "timeline", "title": "Recent Activity",
  "events": [
    {"date":"Mar 20, 2024","title":"New user registered","description":"John Doe joined the platform","color":"#ec4899"},
    {"date":"Mar 19, 2024","title":"Order #1234 completed","description":"Payment of $450 received"},
    {"date":"Mar 18, 2024","title":"System update deployed","description":"v2.3.1 — performance improvements","color":"#a855f7"}
  ]
}

HERO component:
{ "id": "hero_1", "type": "hero", "title": "Welcome Back!", "description": "Here's what's happening today.", "submitLabel": "View Reports" }

LIST component:
{ "id": "list_1", "type": "list", "title": "Top Items",
  "data": [
    {"id":"i1","title":"Product Alpha","description":"Best seller this month","icon":"🥇","value":"$12,400"},
    {"id":"i2","title":"Product Beta","description":"Trending upward","icon":"🥈","value":"$9,800"},
    {"id":"i3","title":"Product Gamma","description":"Steady performer","icon":"🥉","value":"$7,200"}
  ]
}

GALLERY component:
{ "id": "gallery_1", "type": "gallery", "title": "Media",
  "images": [
    {"src":"https://picsum.photos/400/300?random=1","alt":"Image 1","caption":"Caption one"},
    {"src":"https://picsum.photos/400/300?random=2","alt":"Image 2","caption":"Caption two"},
    {"src":"https://picsum.photos/400/300?random=3","alt":"Image 3","caption":"Caption three"}
  ]
}

RULES:
1. Generate 2-4 pages with 2-4 components each
2. Use REAL, contextually appropriate data for the app domain
3. Include a stats component on the main/dashboard page
4. Include at least one table with real-looking data
5. Include at least one form
6. Mix component types thoughtfully across pages
7. Return ONLY valid JSON — no markdown, no explanation`;

export async function generateAppConfig(
  prompt: string
): Promise<SanitizeResult & { rawResponse: string }> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Generate a complete, production-quality app configuration for: "${prompt}"\n\nReturn ONLY the JSON object. No backticks, no markdown, no explanation.`,
      },
    ],
    temperature: 0.65,
    max_tokens: 4096,
  });

  const rawResponse = completion.choices[0]?.message?.content ?? "{}";

  let parsed: unknown;
  try {
    const cleaned = rawResponse
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to extract JSON object from response
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[0]); }
      catch { parsed = { name: "Generated App", pages: [] }; }
    } else {
      parsed = { name: "Generated App", pages: [] };
    }
  }

  const result = sanitizeConfig(parsed);
  return { ...result, rawResponse };
}

export async function regenerateComponent(
  appConfig: AppConfig,
  componentId: string,
  instructions: string
): Promise<AppConfig> {
  const prompt = `You are editing an existing app configuration JSON.

CURRENT CONFIG:
${JSON.stringify(appConfig, null, 2)}

INSTRUCTION: "${instructions}"

Apply the instruction to modify the app. You may:
- Add new components to existing pages
- Modify existing component data or fields
- Add new pages
- Change titles, descriptions, or data

Return the COMPLETE updated app configuration as valid JSON only.
No markdown, no backticks, no explanation. Just the JSON object.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a JSON editor. Return only valid JSON. No markdown, no backticks, no explanation whatsoever.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return sanitizeConfig(parsed).config;
  } catch {
    // Try extracting JSON
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { return sanitizeConfig(JSON.parse(jsonMatch[0])).config; }
      catch { return appConfig; }
    }
    return appConfig;
  }
}
