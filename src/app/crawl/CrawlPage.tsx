'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CrawlPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const [elements, setElements] = useState<{ text: string; selector: string; type: string }[]>([]);
  const [selectedSelectors, setSelectedSelectors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (url) {
      fetch(`/api/crawl?url=${encodeURIComponent(url)}`)
        .then(res => res.json())
        .then(data => {
          if (data.html) {
            // 파싱해서 요소 추출
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.html, 'text/html');
            const titles = Array.from(doc.querySelectorAll('h1, h2, h3')).map(el => ({ text: el.textContent?.trim(), selector: getSelector(el as HTMLElement), type: 'title' }));
            const buttons = Array.from(doc.querySelectorAll('button, input[type="submit"]')).map(el => ({ text: (el as HTMLInputElement).value || el.textContent?.trim(), selector: getSelector(el as HTMLElement), type: 'button' }));
            const links = Array.from(doc.querySelectorAll('a')).map(el => ({ text: el.textContent?.trim(), selector: getSelector(el as HTMLElement), type: 'link' }));
            setElements([...titles, ...buttons, ...links]);
          } else {
            alert('크롤링 실패: ' + data.error);
          }
        })
        .catch(err => alert('오류: ' + err.message))
        .finally(() => setLoading(false));
    }
  }, [url]);

  const getSelector = (element: HTMLElement): string => {
    // ID가 있으면 가장 우선
    if (element.id) {
      return `#${element.id}`;
    }
    
    // 클래스명이 있으면 사용
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(cls => cls);
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }
    
    // 고유한 경로 생성
    const path: string[] = [];
    let current: HTMLElement | null = element;
    
    while (current && current.parentElement) {
      let selector = current.tagName.toLowerCase();
      
      // 형제 요소들 중에서 몇 번째인지 확인
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current);
        if (siblings.filter(sibling => 
          (sibling as HTMLElement).tagName === current!.tagName
        ).length > 1) {
          selector += `:nth-child(${index + 1})`;
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
      
      // 너무 깊어지지 않도록 제한
      if (path.length > 5) break;
    }
    
    return path.join(' > ') || element.tagName.toLowerCase();
  };

  const handleCrawl = async () => {
    if (selectedSelectors.length === 0) {
      alert('요소를 선택하세요.');
      return;
    }
    // 크롤링 API 호출
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, selector: selectedSelectors }),
    });
    const data = await res.json();
    if (data.content) {
      // 카카오톡 전송
      const sendRes = await fetch('/api/send-kakao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content, url }),
      });
      if (sendRes.ok) {
        alert('크롤링 완료 및 전송됨');
      } else {
        alert('전송 실패');
      }
    } else {
      alert('추출 실패');
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">크롤링 페이지</h1>
      <p>URL: {url}</p>
      <p>선택된 항목 수: {selectedSelectors.length}</p>
      <button onClick={handleCrawl} className="bg-green-500 text-white p-2 rounded mb-4" disabled={selectedSelectors.length === 0}>
        크롤링 실행
      </button>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">추출할 요소 선택:</h2>
        {elements.map((el, index) => (
          <div key={index} className="flex items-center mb-1">
            <input
              type="checkbox"
              id={`el-${index}`}
              checked={selectedSelectors.includes(el.selector)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedSelectors([...selectedSelectors, el.selector]);
                } else {
                  setSelectedSelectors(selectedSelectors.filter(s => s !== el.selector));
                }
              }}
            />
            <label htmlFor={`el-${index}`} className="ml-2">
              [{el.type}] {el.text || '텍스트 없음'} - {el.selector}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
