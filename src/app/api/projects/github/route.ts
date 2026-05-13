import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repoUrl = searchParams.get("url");
  const password = request.headers.get("x-admin-password");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized: Incorrect password" }, { status: 401 });
  }

  if (!repoUrl) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    let cleanUrl = repoUrl.trim().replace(/\/$/, "");
    if (cleanUrl.endsWith(".git")) {
      cleanUrl = cleanUrl.slice(0, -4);
    }
    const urlParts = cleanUrl.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repo = urlParts[1];

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
        "Accept": "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`GitHub API failed: ${res.status} ${res.statusText} - ${errorData}`);
    }

    const data = await res.json();

    let description = data.description;
    
    // Fallback: Fetch README and extract the first paragraph
    if (!description) {
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
          headers: {
            ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
            "Accept": "application/vnd.github.v3.raw",
          },
        });
        if (readmeRes.ok) {
          const readmeText = await readmeRes.text();
          // Find the first paragraph (non-header, non-empty line)
          const lines = readmeText.split('\n');
          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine && !cleanLine.startsWith('#') && !cleanLine.startsWith('<') && !cleanLine.startsWith('!')) {
              description = cleanLine;
              break;
            }
          }
        }
      } catch (e) {
        // Ignore README fetch errors
      }
    }

    return NextResponse.json({
      title: data.name,
      description: description || "No description provided.",
      tech: data.topics || [],
      link: data.homepage || "#",
      code: repoUrl,
      imageSrc: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
      year: new Date(data.created_at).getFullYear().toString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
