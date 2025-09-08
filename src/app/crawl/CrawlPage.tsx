'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';

export default function CrawlPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const [html, setHtml] = useState('');
  const [selectors, setSelectors] = useState<{ type: string; selector: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [recipient, setRecipient] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => (el as HTMLElement).style.border = '');

        selectors.forEach(sel => {
          try {
            const elements = doc.querySelectorAll(sel.selector);
            elements.forEach(el => (el as HTMLElement).style.border = '2px solid red');
          } catch (e) {
            // 유효하지 않은 셀렉터 무시
          }
        });
      }
    }
  }, [selectors, html]);

  const handleCrawl = async () => {
    if (selectors.length === 0) {
      alert('요소를 추가하세요.');
      return;
    }
    setShowModal(true);
  };

  const handleSend = async () => {
    if (!recipient) {
      alert('이메일 주소를 입력하세요.');
      return;
    }
    // 크롤링 API 호출
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, selectors: selectors.map(s => s.selector) }),
    });
    const data = await res.json();
    if (data.content) {
      // 이메일 전송
      const sendRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content, url, email: recipient }),
      });
      if (sendRes.ok) {
        alert('크롤링 완료 및 전송됨');
        setShowModal(false);
        setRecipient('');
      } else {
        alert('전송 실패');
      }
    } else {
      alert('추출 실패');
    }
  };

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

  const addSelector = (type: string) => {
    setSelectors(prev => [...prev, { type, selector: '' }]);
  };

  const updateSelector = (index: number, selector: string) => {
    setSelectors(prev => prev.map((s, i) => i === index ? { ...s, selector } : s));
  };

  const removeSelector = (index: number) => {
    setSelectors(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">크롤링 페이지</h1>
      <p>URL: {url}</p>
      <p>추가된 항목 수: {selectors.length}</p>
      <div className="mb-4">
        <button onClick={() => addSelector('번호')} className="bg-blue-500 text-white p-2 rounded mr-2">번호 추가</button>
        <button onClick={() => addSelector('제목')} className="bg-blue-500 text-white p-2 rounded mr-2">제목 추가</button>
        <button onClick={() => addSelector('날짜')} className="bg-blue-500 text-white p-2 rounded mr-2">날짜 추가</button>
        <button onClick={() => addSelector('조회수')} className="bg-blue-500 text-white p-2 rounded mr-2">조회수 추가</button>
        <button onClick={() => addSelector('링크')} className="bg-blue-500 text-white p-2 rounded mr-2">링크 추가</button>
      </div>
      <button onClick={handleCrawl} className="bg-green-500 text-white p-2 rounded mb-4" disabled={selectors.length === 0}>
        크롤링 실행
      </button>
      <div className="mb-4">
        {selectors.map((sel, index) => (
          <div key={index} className="flex items-center mb-2">
            <span className="mr-2">{sel.type}:</span>
            <input
              type="text"
              value={sel.selector}
              onChange={(e) => updateSelector(index, e.target.value)}
              placeholder="CSS Selector 입력"
              className="border p-2 flex-1 mr-2"
            />
            <button onClick={() => removeSelector(index)} className="bg-red-500 text-white p-2 rounded">제거</button>
          </div>
        ))}
      </div>
      <div className="border p-4 max-h-96 overflow-auto">
        <iframe
          ref={iframeRef}
          srcDoc={html}
          className="w-full h-full"
          sandbox="allow-same-origin"
          onLoad={() => {
            if (iframeRef.current) {
              const doc = iframeRef.current.contentDocument;
              if (doc) {
                // 요소 선택 기능 추가
                const handleClick = (e: Event) => {
                  e.preventDefault();
                  const target = e.target as HTMLElement;
                  const selector = getSelector(target);
                  setSelectors(prev => {
                    const existing = prev.find(s => s.selector === selector);
                    if (existing) {
                      return prev.filter(s => s.selector !== selector);
                    } else {
                      return [...prev, { type: '선택', selector }];
                    }
                  });
                };

                const handleMouseOver = (e: Event) => {
                  const target = e.target as HTMLElement;
                  const selector = getSelector(target);
                  if (!selectors.some(s => s.selector === selector)) {
                    target.style.border = '2px solid gray';
                  }
                };

                const handleMouseOut = (e: Event) => {
                  const target = e.target as HTMLElement;
                  const selector = getSelector(target);
                  if (!selectors.some(s => s.selector === selector)) {
                    target.style.border = '';
                  }
                };

                doc.addEventListener('click', handleClick);
                doc.addEventListener('mouseover', handleMouseOver);
                doc.addEventListener('mouseout', handleMouseOut);
              }
            }
          }}
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded">
            <h2 className="text-lg font-bold mb-4">알림 전송</h2>
            <input
              type="email"
              placeholder="이메일 주소"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="border p-2 w-full mb-4"
            />
            <div className="flex justify-end">
              <button onClick={() => setShowModal(false)} className="mr-2 bg-gray-500 text-white p-2 rounded">
                취소
              </button>
              <button onClick={handleSend} className="bg-blue-500 text-white p-2 rounded">
                전송
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
