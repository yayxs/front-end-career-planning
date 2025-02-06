'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { StarIcon } from '@heroicons/react/24/solid';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';

interface Repository {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  url: string;
  language: string;
  category: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  updatedAt: string;
}

const CATEGORIES = ['All', 'Meta-Frameworks'] as const;

type Category = (typeof CATEGORIES)[number];

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Fetch error:', res.status, res.statusText);
    throw new Error('Failed to fetch data');
  }
  return res.json();
};

function SkeletonCard() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          <div className="ml-2 h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          <div className="ml-4 space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// Number of repositories in the backend
const REPOS_COUNT = 3; // Matches the length of FRONTEND_REPOS in route.ts

export default function Home() {
  const { data: repos, error, isLoading } = useSWR<Repository[]>('/api/github', fetcher);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  console.log('SWR state:', { data: repos, error, isLoading });

  const skeletonCards = useMemo(
    () => Array.from({ length: REPOS_COUNT }, (_, i) => <SkeletonCard key={i} />),
    []
  );

  const filteredAndSortedRepos = useMemo(() => {
    let filtered = repos || [];
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((repo) => repo.category === selectedCategory);
    }
    return filtered.sort((a, b) => b.stars - a.stars);
  }, [repos, selectedCategory]);

  if (error) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="rounded-lg bg-red-50 px-6 py-4 text-red-500">
          Failed to load data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="mb-8 text-4xl font-bold text-gray-900">Frontend Projects Star Ranking</h1>

          {/* Category filters */}
          <div className="mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={twMerge(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          {isLoading ? (
            skeletonCards
          ) : filteredAndSortedRepos.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center text-gray-500">
              No projects found in this category
            </div>
          ) : (
            filteredAndSortedRepos.map((repo, index) => (
              <div
                key={repo.fullName}
                className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center font-semibold text-gray-500">
                      #{index + 1}
                    </div>
                    <Image
                      src={repo.owner.avatarUrl}
                      alt={repo.owner.login}
                      width={40}
                      height={40}
                      className="ml-2 rounded-full"
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
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">by {repo.owner.login}</p>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {repo.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-yellow-500">
                    <StarIcon className="h-5 w-5" />
                    <span className="ml-1 font-semibold">
                      {new Intl.NumberFormat().format(repo.stars)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
