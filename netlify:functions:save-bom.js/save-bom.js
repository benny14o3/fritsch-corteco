exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const GITHUB_TOKEN  = process.env.GITHUB_TOKEN;
  const GITHUB_REPO   = "benny14o3/fritsch-corteco";
  const GITHUB_FILE   = "data.json";
  const GITHUB_BRANCH = "main";

  if (!GITHUB_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: "Token nicht konfiguriert" }) };
  }

  try {
    const payload = JSON.parse(event.body);

    // Aktuellen SHA holen
    const infoRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}?ref=${GITHUB_BRANCH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}`, "User-Agent": "fritsch-bom-app" } }
    );
    const info = await infoRes.json();
    const sha  = info.sha;

    // Inhalt als Base64
    const content = Buffer.from(
      JSON.stringify(payload, null, 2), "utf-8"
    ).toString("base64");

    // Commit
    const commitRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "fritsch-bom-app"
        },
        body: JSON.stringify({
          message: `BOM Update ${new Date().toLocaleString("de-DE")}`,
          content,
          sha,
          branch: GITHUB_BRANCH
        })
      }
    );

    if (commitRes.ok) {
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } else {
      const err = await commitRes.json();
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
