import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const OWNER = "itstoasti";
const REPO = "portfolio";
const FILE_PATH = "src/data/projects.json";

export async function POST(request: Request) {
  const password = request.headers.get("x-admin-password");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title } = await request.json();

    // Local
    if (process.env.NODE_ENV === 'development') {
      const fullPath = path.join(process.cwd(), FILE_PATH);
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const filtered = data.filter((p: any) => p.title !== title);
      fs.writeFileSync(fullPath, JSON.stringify(filtered, null, 2));
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ success: true });
      }
      throw new Error("GITHUB_TOKEN missing");
    }

    // GitHub
    const getRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      { headers: { Authorization: `Bearer ${githubToken}` } }
    );
    const fileData = await getRes.json();
    const projects = JSON.parse(Buffer.from(fileData.content, "base64").toString());
    const updated = projects.filter((p: any) => p.title !== title);
    
    await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Delete project: ${title}`,
          content: Buffer.from(JSON.stringify(updated, null, 2)).toString("base64"),
          sha: fileData.sha,
        }),
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
