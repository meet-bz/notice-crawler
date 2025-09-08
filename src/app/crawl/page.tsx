import { Suspense } from 'react';
import CrawlPage from './CrawlPage';

export default function Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <CrawlPage />
    </Suspense>
  );
}
