import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE_PATH = "src/data/projects.json";

export async function GET() {
  try {
    const fullPath = path.join(process.cwd(), FILE_PATH);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}
