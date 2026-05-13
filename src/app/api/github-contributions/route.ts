import { NextResponse } from "next/server";

export async function GET() {
  const githubToken = process.env.GITHUB_TOKEN;
  const username = "itstoasti";

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    const data = await res.json();

    if (data.errors) {
      console.error("GitHub API errors:", data.errors);
      return NextResponse.json({ error: data.errors[0].message }, { status: 400 });
    }

    if (!data.data || !data.data.user) {
      console.error("Unexpected API response:", JSON.stringify(data));
      return NextResponse.json({ error: "Invalid GitHub API response" }, { status: 500 });
    }

    return NextResponse.json(data.data.user.contributionsCollection.contributionCalendar);
  } catch (err) {
    console.error("Failed to fetch contributions:", err);
    return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 });
  }

}
