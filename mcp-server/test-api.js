const API_BASE = process.env.JOOMLA_API_BASE || "http://joomla/api/index.php/v1";
const API_TOKEN = process.env.JOOMLA_API_TOKEN;

console.log("Testing API connection to:", API_BASE);
console.log("Token:", API_TOKEN ? "Set" : "Not set");
console.log("Fetching articles...", API_TOKEN);

try {
    const response = await fetch(API_BASE + "/content/articles", {
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Accept': 'application/vnd.api+json'
        }
    });
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
} catch (error) {
    console.error("Error:", error.message);
}
