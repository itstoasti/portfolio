import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const OWNER = "itstoasti";
const REPO = "portfolio";
const FILE_PATH = "src/data/settings.json";

export async function GET() {
  // In development, read from local file system for immediate feedback
  if (process.env.NODE_ENV === 'development') {
    try {
      const fullPath = path.join(process.cwd(), FILE_PATH);
      if (fs.existsSync(fullPath)) {
        const settings = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        return NextResponse.json(settings);
      }
    } catch (err) {
      console.error("Local fetch failed", err);
    }
  }

  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const getRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        headers: { ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}) },
        next: { revalidate: 0 } // Ensure we get fresh data
      }
    );

    if (!getRes.ok) {
        // Fallback to default if GitHub fetch fails
        return NextResponse.json({ 
          showUiLibrary: true, 
          showSocialLinks: true,
          socialLinks: [] 
        });
    }

    const fileData = await getRes.json();
    const settings = JSON.parse(Buffer.from(fileData.content, "base64").toString());
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const password = request.headers.get("x-admin-password");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized: Incorrect password" }, { status: 401 });
  }

  try {
    const settingsData = await request.json();

    // In development, write to local file system so it's immediate
    if (process.env.NODE_ENV === 'development') {
      try {
        const fullPath = path.join(process.cwd(), FILE_PATH);
        fs.writeFileSync(fullPath, JSON.stringify(settingsData, null, 2));
      } catch (err) {
        console.error("Local write failed", err);
      }
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ success: true, localOnly: true });
      }
      throw new Error("GITHUB_TOKEN is missing.");
    }

    // 1. Get current settings.json file data (to get SHA)
    const getRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        headers: { ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}) },
        next: { revalidate: 0 }
      }
    );

    let sha;
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    const updatedContent = Buffer.from(JSON.stringify(settingsData, null, 2)).toString("base64");

    // 2. Commit back to GitHub
    const putRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update site settings",
          content: updatedContent,
          ...(sha ? { sha } : {}),
        }),
      }
    );

    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new Error(`Failed to commit to GitHub: ${putRes.status} - ${errText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
