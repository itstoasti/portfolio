import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const OWNER = "itstoasti";
const REPO = "portfolio";
const FILE_PATH = "src/data/projects.json";

export async function POST(request: Request) {
  const password = request.headers.get("x-admin-password");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized: Incorrect password" }, { status: 401 });
  }

  try {
    const { base64Image, imageFilename, ...projectData } = await request.json();

    // Local development: Write to file system for immediate feedback
    if (process.env.NODE_ENV === 'development') {
      try {
        const fullPath = path.join(process.cwd(), FILE_PATH);
        const currentData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        
        let finalProjectData = { ...projectData };
        
        if (base64Image && imageFilename) {
          const publicDir = path.join(process.cwd(), "public/projects");
          if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
          
          const imagePath = path.join(publicDir, imageFilename);
          const base64Content = base64Image.split(",")[1] || base64Image;
          fs.writeFileSync(imagePath, Buffer.from(base64Content, "base64"));
          finalProjectData.imageSrc = `/projects/${imageFilename}`;
        }

        // Upsert: replace if title matches, otherwise append
        const index = currentData.findIndex((p: any) => p.title === finalProjectData.title);
        if (index > -1) {
          currentData[index] = finalProjectData;
        } else {
          currentData.push(finalProjectData);
        }
        
        fs.writeFileSync(fullPath, JSON.stringify(currentData, null, 2));
      } catch (err) {
        console.error("Local write failed", err);
      }
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ success: true, localOnly: true });
      }
      throw new Error("GITHUB_TOKEN is missing on Vercel. Please add it to your environment variables.");
    }

    // --- GitHub Commit Logic ---
    
    // 1. Upload image if provided
    let finalProjectData = { ...projectData };
    if (base64Image && imageFilename) {
      const imagePath = `public/projects/${imageFilename}`;
      const base64Content = base64Image.split(",")[1] || base64Image;

      const imagePutRes = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${imagePath}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${githubToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Add/Update image: ${imageFilename}`,
            content: base64Content,
          }),
        }
      );

      if (!imagePutRes.ok) {
        const errText = await imagePutRes.text();
        throw new Error(`Failed to upload image to GitHub: ${imagePutRes.status} - ${errText}`);
      }
      
      finalProjectData.imageSrc = `/projects/${imageFilename}`;
    }

    // 2. Get current projects.json file data
    const getRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        headers: { Authorization: `Bearer ${githubToken}` },
        next: { revalidate: 0 }
      }
    );

    if (!getRes.ok) {
      const errText = await getRes.text();
      throw new Error(`Failed to fetch current data from GitHub: ${getRes.status} - ${errText}`);
    }
    const fileData = await getRes.json();
    const currentProjects = JSON.parse(Buffer.from(fileData.content, "base64").toString());

    // 3. Upsert project
    const index = currentProjects.findIndex((p: any) => p.title === finalProjectData.title);
    if (index > -1) {
      currentProjects[index] = finalProjectData;
    } else {
      currentProjects.push(finalProjectData);
    }
    
    const updatedContent = Buffer.from(JSON.stringify(currentProjects, null, 2)).toString("base64");

    // 4. Commit back to GitHub
    const putRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Update projects: ${finalProjectData.title}`,
          content: updatedContent,
          sha: fileData.sha,
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
