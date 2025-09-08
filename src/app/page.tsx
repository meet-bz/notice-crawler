'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      // 크롤링 페이지로 이동
      window.location.href = `/crawl?url=${encodeURIComponent(url)}`;
    }
  };

  return (
    <div className="font-sans min-h-screen p-8 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-8">공지사항 크롤러</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="웹사이트 URL을 입력하세요"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          크롤링 시작
        </button>
      </form>
    </div>
  );
}
