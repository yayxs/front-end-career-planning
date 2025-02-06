import { Octokit } from 'octokit';
import { NextResponse } from 'next/server';

// 创建Octokit实例
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// 定义前端框架项目列表
const FRONTEND_REPOS = ['vercel/next.js'];

export async function GET() {
  try {
    const reposPromises = FRONTEND_REPOS.map(async (repo) => {
      const [owner, name] = repo.split('/');
      const { data } = await octokit.rest.repos.get({
        owner,
        repo: name,
      });

      return {
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
      };
    });

    const repos = await Promise.all(reposPromises);
    const sortedRepos = repos.sort((a, b) => b.stars - a.stars);

    return NextResponse.json(sortedRepos);
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 });
  }
}
