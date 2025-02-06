# Frontend Star Ranking

A website that displays GitHub star rankings for popular frontend projects.

## Features

- 📊 Real-time display of GitHub star counts
- 🏷️ Project categorization (Meta-Frameworks, Frameworks, UI Libraries, etc.)
- 📱 Responsive design for both desktop and mobile
- 🔄 Local caching to reduce API calls
- 📈 Visual comparison of star differences between projects
- ⚡ Built with Next.js and TypeScript

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [SWR](https://swr.vercel.app/) - Data fetching
- [GitHub API](https://docs.github.com/en/rest) - Data source

## Getting Started

### Prerequisites

- Node.js 18.x or later
- pnpm 8.x or later

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yayxs/front-end-star-ranking.git
cd front-end-star-ranking
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file in the root directory and add your GitHub token:

```env
GITHUB_TOKEN=your_github_token_here
```

4. Start the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### GitHub Token

To avoid API rate limits, you need to create a GitHub Personal Access Token:

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Generate a new token with `public_repo` scope
3. Copy the token to your `.env.local` file

### Adding Projects

Edit `app/api/github/route.ts` to add or modify projects:

```typescript
const FRONTEND_REPOS: RepoInfo[] = [
  { repo: 'vercel/next.js', category: 'Meta-Frameworks' },
  // Add more projects here
];
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
