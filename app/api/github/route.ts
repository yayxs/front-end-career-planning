import { Octokit } from 'octokit';
import { NextResponse } from 'next/server';

// Create Octokit instance
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface RepoInfo {
  repo: string;
  category: string;
}

interface RepoData {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  url: string;
  language: string | null;
  owner: {
    login: string;
    avatarUrl: string;
  };
  updatedAt: string;
  category: string;
}

// Frontend projects by category
const FRONTEND_REPOS: RepoInfo[] = [
  { repo: 'vercel/next.js', category: 'Meta-Frameworks' },
  { repo: 'withastro/astro', category: 'Meta-Frameworks' },
  { repo: 'nuxt/nuxt', category: 'Meta-Frameworks' },
];

export async function GET() {
  try {
    console.log('Starting GitHub API requests...');
    console.log('Using repos:', FRONTEND_REPOS);

    const reposPromises = FRONTEND_REPOS.map(async ({ repo, category }) => {
      try {
        const [owner, name] = repo.split('/');
        console.log(`Fetching repo: ${owner}/${name}`);

        const { data } = await octokit.rest.repos.get({
          owner,
          repo: name,
        });

        const repoData: RepoData = {
          name: data.name,
          fullName: data.full_name,
          description: data.description,
          stars: data.stargazers_count,
          url: data.html_url,
          language: data.language,
          owner: {
            login: data.owner.login,
            avatarUrl: data.owner.avatar_url,
          },
          updatedAt: data.updated_at,
          category,
        };

        return repoData;
      } catch (error) {
        console.error(`Error fetching ${repo}:`, error);
        return null;
      }
    });

    const repos = (await Promise.all(reposPromises)).filter(
      (repo): repo is RepoData => repo !== null
    );
    const sortedRepos = repos.sort((a, b) => b.stars - a.stars);

    console.log(`Successfully fetched ${sortedRepos.length} repos`);
    return NextResponse.json(sortedRepos);
  } catch (error) {
    console.error('Error in GitHub API route:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 });
  }
}
