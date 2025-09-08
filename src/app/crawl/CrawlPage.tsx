'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';

export default function CrawlPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const [html, setHtml] = useState('');
  const [selectors, setSelectors] = useState<{ [key: string]: string }>({
    번호: '',
    제목: '',
    날짜: '',
    조회수: '',
    링크: ''
  });
  const [currentMode, setCurrentMode] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [extractedData, setExtractedData] = useState<{ [key: string]: string }>({});
  const colorMap: { [key: string]: string } = {
    번호: 'blue',
    제목: 'green',
    날짜: 'yellow',
    조회수: 'orange',
    링크: 'purple'
  };
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (url) {
      setInputUrl(url);
      handleAnalyze(url);
    } else {
      // URL이 없으면 기본 메시지 표시
      setHtml('<div style="display: flex; justify-content: center; align-items: center; height: 200px; font-size: 18px;">URL을 입력하여 분석을 시작하세요</div>');
    }
  }, [url]);

  const handleAnalyze = async (analyzeUrl: string) => {
    if (!analyzeUrl) return;
    setIsAnalyzing(true);
    setHtml('<div style="display: flex; justify-content: center; align-items: center; height: 200px; font-size: 18px;">분석 중...</div>');
    try {
      const res = await fetch(`/api/crawl?url=${encodeURIComponent(analyzeUrl)}`);
      const data = await res.json();
      if (data.html) {
        setHtml(data.html);
      } else {
        setHtml('<div style="color: red; padding: 20px;">크롤링 실패: ' + data.error + '</div>');
      }
    } catch (err) {
      setHtml('<div style="color: red; padding: 20px;">오류: ' + (err as Error).message + '</div>');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => (el as HTMLElement).style.border = '');

        Object.entries(selectors).forEach(([type, sel]) => {
          if (sel) {
            try {
              const elements = doc.querySelectorAll(sel);
              elements.forEach(el => {
                (el as HTMLElement).style.border = `2px solid ${colorMap[type] || 'red'}`;
                (el as HTMLElement).style.boxShadow = `0 0 5px ${colorMap[type] || 'red'}`;
              });
            } catch (e) {
              // 유효하지 않은 셀렉터 무시
            }
          }
        });
      }
    }
  }, [selectors, html]);

  const handleCrawl = async () => {
    const activeSelectors = Object.values(selectors).filter(s => s.trim() !== '');
    if (activeSelectors.length === 0) {
      alert('요소를 선택하세요.');
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
      body: JSON.stringify({ url: inputUrl, selectors: Object.values(selectors).filter(s => s.trim() !== '') }),
    });
    const data = await res.json();
    if (data.content) {
      // 추출된 데이터 표시
      setExtractedData(data.content);
      // 이메일 전송
      const sendRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content, url: inputUrl, email: recipient }),
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

  const updateSelector = (type: string, selector: string) => {
    setSelectors(prev => ({ ...prev, [type]: selector }));
  };

  const combineSelectors = (existing: string, newSelector: string): string => {
    if (!existing) return newSelector;
    const selectors = existing.split(',').map(s => s.trim()).filter(s => s);
    if (!selectors.includes(newSelector)) {
      selectors.push(newSelector);
    }
    return selectors.join(', ');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">크롤링 페이지</h1>
      {url && <p className="mb-4">분석 중인 URL: {url}</p>}
      <div className="mb-4">
        <p className="mb-2">선택 모드:</p>
        <button onClick={() => setCurrentMode('번호')} className={`p-2 rounded mr-2 ${currentMode === '번호' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>번호 선택</button>
        <button onClick={() => setCurrentMode('제목')} className={`p-2 rounded mr-2 ${currentMode === '제목' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>제목 선택</button>
        <button onClick={() => setCurrentMode('날짜')} className={`p-2 rounded mr-2 ${currentMode === '날짜' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>날짜 선택</button>
        <button onClick={() => setCurrentMode('조회수')} className={`p-2 rounded mr-2 ${currentMode === '조회수' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>조회수 선택</button>
        <button onClick={() => setCurrentMode('링크')} className={`p-2 rounded mr-2 ${currentMode === '링크' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}>링크 선택</button>
        <button onClick={() => setCurrentMode(null)} className={`p-2 rounded ${currentMode === null ? 'bg-gray-500 text-white' : 'bg-gray-200'}`}>선택 해제</button>
      </div>
      <button onClick={handleCrawl} className="bg-green-500 text-white p-2 rounded mb-4" disabled={Object.values(selectors).every(s => s.trim() === '')}>
        크롤링 실행
      </button>
      <div className="mb-4">
        {Object.entries(selectors).map(([type, selector]) => (
          <div key={type} className="flex items-center mb-2">
            <span className="mr-2 w-16">{type}:</span>
            <input
              type="text"
              value={selector}
              onChange={(e) => updateSelector(type, e.target.value)}
              placeholder="CSS Selector 입력"
              className="border p-2 flex-1 mr-2"
            />
          </div>
        ))}
      </div>
      <div className="border p-4 mb-4" style={{ minHeight: '400px' }}>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          className="w-full"
          style={{ height: 'auto', minHeight: '400px' }}
          sandbox="allow-same-origin allow-scripts"
          onLoad={() => {
            if (iframeRef.current) {
              const doc = iframeRef.current.contentDocument;
              if (doc) {
                // 높이 자동 조정
                const body = doc.body;
                const html = doc.documentElement;
                const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                iframeRef.current.style.height = height + 'px';

                // 요소 선택 기능 추가
                const handleClick = (e: Event) => {
                  e.preventDefault();
                  if (!currentMode) return;
                  const target = e.target as HTMLElement;
                  const selector = getSelector(target);
                  setSelectors(prev => ({
                    ...prev,
                    [currentMode]: combineSelectors(prev[currentMode], selector)
                  }));
                };

                const handleMouseOver = (e: Event) => {
                  const target = e.target as HTMLElement;
                  const selector = getSelector(target);
                  if (currentMode && !selectors[currentMode].includes(selector)) {
                    target.style.border = `2px solid ${colorMap[currentMode] || 'gray'}`;
                    target.style.boxShadow = `0 0 5px ${colorMap[currentMode] || 'gray'}`;
                  }
                };

                const handleMouseOut = (e: Event) => {
                  const target = e.target as HTMLElement;
                  const selector = getSelector(target);
                  if (currentMode && !selectors[currentMode].includes(selector)) {
                    target.style.border = '';
                    target.style.boxShadow = '';
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
      {Object.keys(extractedData).length > 0 && (
        <div className="border p-4 mt-4">
          <h2 className="text-lg font-bold mb-4">추출된 데이터</h2>
          {Object.entries(extractedData).map(([type, value]) => (
            <div key={type} className="mb-2">
              <strong>{type}:</strong> {value}
            </div>
          ))}
        </div>
      )}
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
