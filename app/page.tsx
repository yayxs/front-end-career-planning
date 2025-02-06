'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { StarIcon } from '@heroicons/react/24/solid';
import { twMerge } from 'tailwind-merge';

interface Repository {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  url: string;
  language: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: repos, error, isLoading } = useSWR<Repository[]>('/api/github', fetcher);
  const [sortBy, setSortBy] = useState<'stars' | 'name'>('stars');

  if (error) return <div className="text-center text-red-500">Failed to load</div>;
  if (isLoading) return <div className="text-center">Loading...</div>;

  const sortedRepos = [...(repos || [])].sort((a, b) => {
    if (sortBy === 'stars') {
      return b.stars - a.stars;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="mb-8 text-4xl font-bold text-gray-900">Frontend Projects Star Ranking</h1>
          <div className="mb-6">
            <button
              onClick={() => setSortBy('stars')}
              className={twMerge(
                'rounded-l-md px-4 py-2',
                sortBy === 'stars'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              Sort by Stars
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={twMerge(
                'rounded-r-md px-4 py-2',
                sortBy === 'name'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              Sort by Name
            </button>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          {sortedRepos.map((repo, index) => (
            <div
              key={repo.fullName}
              className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center font-semibold text-gray-500">
                    #{index + 1}
                  </div>
                  <img
                    src={repo.owner.avatarUrl}
                    alt={repo.owner.login}
                    className="ml-2 h-10 w-10 rounded-full"
                  />
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {repo.name}
                      </a>
                    </h2>
                    <p className="text-sm text-gray-500">by {repo.owner.login}</p>
                  </div>
                </div>
                <div className="flex items-center text-yellow-500">
                  <StarIcon className="h-5 w-5" />
                  <span className="ml-1 font-semibold">
                    {new Intl.NumberFormat().format(repo.stars)}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-gray-600">{repo.description}</p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span className="mr-4">Language: {repo.language}</span>
                <span>Updated: {new Date(repo.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
