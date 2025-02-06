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

const CATEGORIES = ['Meta-Frameworks'] as const;

type Category = (typeof CATEGORIES)[number] | null;

// 缓存相关的工具函数
const CACHE_KEY = 'github_stars_cache';
const CACHE_TIME = 60 * 60 * 1000; // 1小时的缓存时间

interface CacheData {
  data: Repository[];
  timestamp: number;
}

const getLocalCache = (): CacheData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // 检查缓存是否过期
    if (now - timestamp > CACHE_TIME) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return { data, timestamp };
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

const setLocalCache = (data: Repository[]) => {
  if (typeof window === 'undefined') return;

  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

const fetcher = async (url: string) => {
  // 首先尝试从缓存获取数据
  const cached = getLocalCache();
  if (cached) {
    console.log('Using cached data');
    return cached.data;
  }

  // 如果没有缓存或缓存过期，则从API获取
  console.log('Fetching fresh data from API');
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Fetch error:', res.status, res.statusText);
    throw new Error('Failed to fetch data');
  }
  const data = await res.json();

  // 缓存新数据
  setLocalCache(data);
  return data;
};

function LoadingSpinner() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="text-sm text-gray-500">Loading projects...</p>
      </div>
    </div>
  );
}

function StarDifference({
  currentStars,
  previousStars,
}: {
  currentStars: number;
  previousStars?: number;
}) {
  if (!previousStars) return null;
  const difference = previousStars - currentStars;
  const percentage = ((difference / previousStars) * 100).toFixed(1);

  return (
    <div className="mt-1 flex items-center gap-2 text-xs">
      <div className="h-1 w-24 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-yellow-400"
          style={{ width: `${100 - Math.abs(Number(percentage))}%` }}
        />
      </div>
      <span className="text-gray-500">
        {new Intl.NumberFormat().format(Math.abs(difference))} stars less
        <span className="ml-1 text-gray-400">({percentage}%)</span>
      </span>
    </div>
  );
}

export default function Home() {
  const {
    data: repos,
    error,
    isLoading,
  } = useSWR<Repository[]>('/api/github', fetcher, {
    revalidateOnFocus: false, // 禁止页面聚焦时重新获取数据
    revalidateOnReconnect: false, // 禁止重新连接时重新获取数据
    dedupingInterval: CACHE_TIME, // 设置数据重新获取的间隔时间
  });
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);

  console.log('SWR state:', { data: repos, error, isLoading });

  const filteredAndSortedRepos = useMemo(() => {
    let filtered = repos || [];
    if (selectedCategory) {
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
    <main className="min-h-screen bg-gray-50 px-3 py-6 sm:px-4 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:mb-8 sm:text-4xl">
            Frontend Projects Star Ranking
          </h1>

          {/* Category filters */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === category ? null : category)
                  }
                  className={twMerge(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm',
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

        <div className="mt-8 sm:mt-12">
          {isLoading ? (
            <LoadingSpinner />
          ) : filteredAndSortedRepos.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-center text-gray-500 sm:p-8">
              No projects found in this category
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredAndSortedRepos.map((repo, index) => (
                <div
                  key={repo.fullName}
                  className="group relative cursor-pointer rounded-lg bg-white p-4 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-100/50 hover:ring-1 hover:ring-blue-100 sm:p-6"
                  title={`View on GitHub: ${repo.url}`}
                >
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                    <div className="flex items-start space-x-3 sm:items-center sm:space-x-4">
                      <div className="flex flex-col items-center sm:flex-row sm:space-x-3">
                        <div className="flex h-6 w-6 items-center justify-center text-sm font-semibold text-gray-500 sm:h-8 sm:w-8 sm:text-base">
                          #{index + 1}
                        </div>
                        <div className="relative mt-1 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105 sm:mt-0">
                          <Image
                            src={repo.owner.avatarUrl}
                            alt={repo.owner.login}
                            width={32}
                            height={32}
                            className="rounded-full sm:h-10 sm:w-10"
                          />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-base font-semibold sm:text-xl">
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 transition-colors duration-300 hover:text-blue-700 hover:underline"
                          >
                            {repo.name}
                          </a>
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <p className="text-xs text-gray-500 sm:text-sm">by {repo.owner.login}</p>
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 transition-colors duration-300 group-hover:bg-blue-100 group-hover:text-blue-800 sm:py-1">
                            {repo.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end">
                      <div className="flex items-center text-yellow-500 transition-transform duration-300 group-hover:scale-110">
                        <StarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="ml-1 text-sm font-semibold sm:text-base">
                          {new Intl.NumberFormat().format(repo.stars)}
                        </span>
                      </div>
                      {index > 0 && (
                        <StarDifference
                          currentStars={repo.stars}
                          previousStars={filteredAndSortedRepos[index - 1].stars}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
