'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function CrawlPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const [html, setHtml] = useState('');
  const [selectedSelectors, setSelectedSelectors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const htmlContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (url) {
      fetch(`/api/crawl?url=${encodeURIComponent(url)}`)
        .then(res => res.json())
        .then(data => {
          if (data.html) {
            setHtml(data.html);
          } else {
            alert('크롤링 실패: ' + data.error);
          }
        })
        .catch(err => alert('오류: ' + err.message))
        .finally(() => setLoading(false));
    }
  }, [url]);

  useEffect(() => {
    if (html && htmlContainerRef.current) {
      // 요소 선택 기능 추가 - 크롤링된 HTML 컨테이너에만 적용
      const handleClick = (e: Event) => {
        e.preventDefault();
        const target = e.target as HTMLElement;
        
        // 크롤링된 HTML 컨테이너 내부의 요소인지 확인
        if (htmlContainerRef.current && htmlContainerRef.current.contains(target)) {
          const selector = getSelector(target);
          setSelectedSelectors(prev => 
            prev.includes(selector) 
              ? prev.filter(s => s !== selector) 
              : [...prev, selector]
          );
        }
      };

      // 컨테이너에 이벤트 리스너 추가
      const container = htmlContainerRef.current;
      container.addEventListener('click', handleClick);
      
      return () => {
        container.removeEventListener('click', handleClick);
      };
    }
  }, [html]);

  useEffect(() => {
    if (htmlContainerRef.current) {
      // 모든 요소 border 초기화
      const allElements = htmlContainerRef.current.querySelectorAll('*');
      allElements.forEach(el => (el as HTMLElement).style.border = '');
      
      // 선택된 셀렉터들에 border 추가
      selectedSelectors.forEach(sel => {
        try {
          const elements = htmlContainerRef.current!.querySelectorAll(sel);
          elements.forEach(el => (el as HTMLElement).style.border = '2px solid red');
        } catch (e) {
          // 유효하지 않은 셀렉터 무시
        }
      });
    }
  }, [selectedSelectors, html]);

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
      <div
        ref={htmlContainerRef}
        dangerouslySetInnerHTML={{ __html: html }}
        className="border p-4 max-h-96 overflow-auto"
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
}
