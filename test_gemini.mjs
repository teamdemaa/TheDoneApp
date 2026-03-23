import { GoogleGenerativeAI } from '@google/generative-ai';

const run = async () => {
    const GTM_GENERATION_PROMPT = `Act as an elite Go-to-Market (GTM) Strategist. Given a product or service idea, your task is to break it down into an actionable, Kanban-style GTM strategy. You must categorize your advice into three core pillars: Positioning, Product, and Promotion. For each pillar, provide at least 2 highly specific, realistic action cards.`;
    const idea = "A new AI app for tracking fitness called FitAI";
    const todayStr = new Date().toISOString().split('T')[0];

    const prompt = `${GTM_GENERATION_PROMPT}\n\nUser Project Idea: ${idea}\nToday's date is ${todayStr}.\n\nPlease output the response strictly in JSON format. The JSON should be an object with four keys: "cards", "experiments", "content", and "todo".
1. "cards": array where each item has id (string), column ("Positioning", "Product", or "Promotion"), index (e.g. "1.1"), title, description, and content.
2. "experiments": array of exactly 3 experiments to test hypotheses. Each item has id (string), col (string "To do"), title, desc, startDate (YYYY-MM-DD format, starting nearby today), endDate (YYYY-MM-DD format, 1-4 weeks after start), recurring (boolean), priority ("High", "Medium", "Low"), and channels.
3. "content": array of 12-15 posts spanning 3 months aligned with the experiments. Each item has id (string), date (YYYY-MM-DD format), theme, content (the post body), category, link (string URL), and experiment (the exact id string of the linked experiment, or empty string).
4. "todo": array of 8-10 coherent tasks logically following the chosen channels and experiments. Each item has id (string or number), text (string title of task), and done (boolean false).

DO NOT wrap the output in markdown code blocks, just return raw JSON without surrounding syntax styling.`;

    try {
        console.log("Sending prompt to Gemini...");
        const genAI = new GoogleGenerativeAI("AIzaSyCAILr0EEeMr-BSyEOQogm2YxCSZm1WqIM");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();
        console.log("RAW OUTPUT START---------");
        console.log(text.substring(0, 500) + "...[truncated]..." + text.substring(text.length - 500));
        console.log("RAW OUTPUT END-----------");

        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            text = text.substring(jsonStart, jsonEnd + 1);
        }
        
        try {
            JSON.parse(text);
            console.log("SUCCESS: JSON Parsed perfectly.");
        } catch(e) {
            console.error("PARSE ERROR:", e.message);
            // write failing text to file to inspect
            import('fs').then(fs => fs.writeFileSync('failed_output.txt', text));
        }

    } catch (e) {
        console.error("API ERROR:", e.message);
    }
};

run();
