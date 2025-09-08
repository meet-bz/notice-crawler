'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';

export default function CrawlPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const [html, setHtml] = useState('<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; font-size: 18px; color: #666;"><h2 style="margin-bottom: 20px;">공지사항 크롤러</h2><p>웹사이트 URL을 입력하고 분석을 시작하세요</p></div>');
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
  const [allowScripts, setAllowScripts] = useState(false);
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
    // URL 파라미터가 있으면 초기 URL로 설정
    if (url) {
      setInputUrl(url);
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

  const handleIframeClick = useCallback((e: Event) => {
    e.preventDefault();
    if (!currentMode) return;
    const target = e.target as HTMLElement;
    const selector = getSelector(target);
    setSelectors(prev => {
      const currentSelectors = prev[currentMode].split(',').map(s => s.trim()).filter(s => s);
      if (currentSelectors.includes(selector)) {
        // 선택 해제
        const newSelectors = currentSelectors.filter(s => s !== selector);
        target.style.border = '';
        target.removeAttribute('data-original-border');
        return {
          ...prev,
          [currentMode]: newSelectors.join(', ')
        };
      } else {
        // 선택 추가
        const selectedType = getElementSelectedType(selector);
        if (selectedType) {
          // 이미 다른 타입으로 선택된 경우, 해당 타입에서 제거하고 현재 타입으로 추가
          const updatedSelectors = { ...prev };
          for (const [type, sel] of Object.entries(updatedSelectors)) {
            if (sel.split(',').map(s => s.trim()).includes(selector)) {
              const typeSelectors = sel.split(',').map(s => s.trim()).filter(s => s !== selector);
              updatedSelectors[type] = typeSelectors.join(', ');
            }
          }
          updatedSelectors[currentMode] = combineSelectors(updatedSelectors[currentMode], selector);
          target.style.border = `2px solid ${colorMap[currentMode] || 'gray'}`;
          return updatedSelectors;
        } else {
          // 새로 선택
          target.style.border = `2px solid ${colorMap[currentMode] || 'gray'}`;
          return {
            ...prev,
            [currentMode]: combineSelectors(prev[currentMode], selector)
          };
        }
      }
    });
  }, [currentMode, selectors, colorMap]);

  const handleIframeMouseOver = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const selector = getSelector(target);

    // 현재 선택 모드가 있고, 아직 선택되지 않은 요소만 호버링
    if (currentMode && !isElementSelected(selector)) {
      // 호버링 전 원래 테두리 색상 저장
      const originalBorder = target.style.border;
      target.setAttribute('data-original-border', originalBorder);
      target.style.border = `2px solid ${colorMap[currentMode] || 'gray'}`;
    }
  }, [currentMode, selectors, colorMap]);

  const handleIframeMouseOut = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const selector = getSelector(target);

    // 선택되지 않은 요소만 테두리 제거
    if (!isElementSelected(selector)) {
      target.style.border = '';
    } else {
      // 선택된 요소는 원래 테두리 색상으로 복원
      const originalBorder = target.getAttribute('data-original-border') || '';
      if (originalBorder) {
        target.style.border = originalBorder;
      } else {
        // 원래 테두리가 없으면 선택된 타입의 색상으로 설정
        const selectedType = getElementSelectedType(selector);
        if (selectedType) {
          target.style.border = `2px solid ${colorMap[selectedType] || 'red'}`;
        }
      }
    }
  }, [selectors, colorMap]);

  const getElementSelectedType = (selector: string): string | null => {
    for (const [type, sel] of Object.entries(selectors)) {
      if (sel.split(',').map(s => s.trim()).includes(selector)) {
        return type;
      }
    }
    return null;
  };

  const isElementSelected = (selector: string): boolean => {
    return Object.values(selectors).some(sel =>
      sel.split(',').map(s => s.trim()).includes(selector)
    );
  };

  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        // 모든 요소 border 초기화
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => (el as HTMLElement).style.border = '');

        // 각 타입별로 테두리 적용
        Object.entries(selectors).forEach(([type, sel]) => {
          if (sel) {
            const selectorList = sel.split(',').map(s => s.trim()).filter(s => s);
            selectorList.forEach(selector => {
              try {
                const elements = doc.querySelectorAll(selector);
                elements.forEach(el => (el as HTMLElement).style.border = `2px solid ${colorMap[type] || 'red'}`);
              } catch (e) {
                // 유효하지 않은 셀렉터 무시
              }
            });
          }
        });
      }
    }
  }, [selectors, html]);

  // 선택 모드 변경 시 iframe 이벤트 리스너 업데이트
  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        // 기존 이벤트 리스너 제거
        doc.removeEventListener('click', handleIframeClick);
        doc.removeEventListener('mouseover', handleIframeMouseOver);
        doc.removeEventListener('mouseout', handleIframeMouseOut);

        // 최신 콜백 함수로 이벤트 리스너 다시 추가
        doc.addEventListener('click', handleIframeClick);
        doc.addEventListener('mouseover', handleIframeMouseOver);
        doc.addEventListener('mouseout', handleIframeMouseOut);
      }
    }
  }, [currentMode, handleIframeClick, handleIframeMouseOver, handleIframeMouseOut]);

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
    // CSS 변경 시 iframe 내 요소들 스타일 업데이트
    setTimeout(() => updateIframeStyles(), 0);
  };

  const updateIframeStyles = () => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        // 모든 요소 border 초기화
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => (el as HTMLElement).style.border = '');

        // 각 타입별로 테두리 적용
        Object.entries(selectors).forEach(([type, sel]) => {
          if (sel) {
            const selectorList = sel.split(',').map(s => s.trim()).filter(s => s);
            selectorList.forEach(selector => {
              try {
                const elements = doc.querySelectorAll(selector);
                elements.forEach(el => (el as HTMLElement).style.border = `2px solid ${colorMap[type] || 'red'}`);
              } catch (e) {
                // 유효하지 않은 셀렉터 무시
              }
            });
          }
        });
      }
    }
  };

  const combineSelectors = (existing: string, newSelector: string): string => {
    if (!existing) return newSelector;
    const selectors = existing.split(',').map(s => s.trim()).filter(s => s);
    if (!selectors.includes(newSelector)) {
      selectors.push(newSelector);
    }

    // 중복 제거
    const uniqueSelectors = [...new Set(selectors)];

    // 공통 패턴으로 최적화 시도
    const optimized = optimizeSelectors(uniqueSelectors);
    return optimized.join(', ');
  };

  const optimizeSelectors = (selectors: string[]): string[] => {
    if (selectors.length <= 1) return selectors;

    // 같은 부모를 공유하는 nth-child 패턴 찾기
    const nthChildPattern = selectors.filter(s => s.includes(':nth-child'));
    if (nthChildPattern.length > 1) {
      const optimized = optimizeNthChildSelectors(nthChildPattern);
      const others = selectors.filter(s => !s.includes(':nth-child'));
      return [...optimized, ...others];
    }

    // 같은 클래스 패턴 찾기
    const classPattern = selectors.filter(s => s.startsWith('.') && !s.includes(' '));
    if (classPattern.length > 1) {
      const optimized = optimizeClassSelectors(classPattern);
      const others = selectors.filter(s => !s.startsWith('.') || s.includes(' '));
      return [...optimized, ...others];
    }

    return selectors;
  };

  const optimizeNthChildSelectors = (selectors: string[]): string[] => {
    const groups: { [key: string]: number[] } = {};

    selectors.forEach(selector => {
      const match = selector.match(/^(.+):nth-child\((\d+)\)$/);
      if (match) {
        const base = match[1];
        const index = parseInt(match[2]);
        if (!groups[base]) groups[base] = [];
        groups[base].push(index);
      } else {
        // 매칭되지 않으면 그대로 유지
        return selector;
      }
    });

    const result: string[] = [];
    Object.entries(groups).forEach(([base, indices]) => {
      if (indices.length === 1) {
        result.push(`${base}:nth-child(${indices[0]})`);
      } else {
        // 연속된 인덱스인 경우 범위로 최적화
        indices.sort((a, b) => a - b);
        let start = indices[0];
        let end = indices[0];

        for (let i = 1; i < indices.length; i++) {
          if (indices[i] === end + 1) {
            end = indices[i];
          } else {
            if (start === end) {
              result.push(`${base}:nth-child(${start})`);
            } else {
              result.push(`${base}:nth-child(n+${start}):nth-child(-n+${end})`);
            }
            start = end = indices[i];
          }
        }

        if (start === end) {
          result.push(`${base}:nth-child(${start})`);
        } else {
          result.push(`${base}:nth-child(n+${start}):nth-child(-n+${end})`);
        }
      }
    });

    return result;
  };

  const optimizeClassSelectors = (selectors: string[]): string[] => {
    // 간단한 클래스 패턴 최적화 (예: .item-1, .item-2, .item-3)
    const patterns = selectors.map(s => s.substring(1)); // . 제거
    const commonPrefix = findCommonPrefix(patterns);

    if (commonPrefix && commonPrefix.length > 2) {
      const baseClass = commonPrefix;
      const variations = patterns.map(p => p.substring(commonPrefix.length));

      // 숫자 패턴인 경우
      if (variations.every(v => /^\d+$/.test(v))) {
        const numbers = variations.map(v => parseInt(v)).sort((a, b) => a - b);
        return [`[class*="${baseClass}"]`]; // attribute selector 사용
      }
    }

    return selectors;
  };

  const findCommonPrefix = (strings: string[]): string => {
    if (strings.length === 0) return '';
    if (strings.length === 1) return strings[0];

    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (strings[i].indexOf(prefix) !== 0) {
        prefix = prefix.substring(0, prefix.length - 1);
        if (prefix === '') return '';
      }
    }
    return prefix;
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">공지사항 크롤러</h1>
      <div className="mb-4">
        <input
          type="url"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="웹사이트 URL을 입력하세요"
          className="border p-2 w-full mb-2"
        />
        <button
          onClick={() => handleAnalyze(inputUrl)}
          disabled={isAnalyzing}
          className="bg-blue-500 text-white p-2 rounded mr-2"
        >
          {isAnalyzing ? '분석 중...' : '크롤링 시작'}
        </button>
        <button
          onClick={() => setAllowScripts(!allowScripts)}
          className={`p-2 rounded ${allowScripts ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          JavaScript {allowScripts ? '활성화' : '비활성화'}
        </button>
      </div>
      <div className="mb-4">
        <button onClick={() => setCurrentMode('번호')} className={`p-2 rounded mr-2 ${currentMode === '번호' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>번호 선택</button>
        <button onClick={() => setCurrentMode('제목')} className={`p-2 rounded mr-2 ${currentMode === '제목' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>제목 선택</button>
        <button onClick={() => setCurrentMode('날짜')} className={`p-2 rounded mr-2 ${currentMode === '날짜' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>날짜 선택</button>
        <button onClick={() => setCurrentMode('조회수')} className={`p-2 rounded mr-2 ${currentMode === '조회수' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>조회수 선택</button>
        <button onClick={() => setCurrentMode('링크')} className={`p-2 rounded mr-2 ${currentMode === '링크' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}>링크 선택</button>
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
          sandbox={allowScripts ? "allow-same-origin allow-scripts" : "allow-same-origin"}
          onLoad={() => {
            if (iframeRef.current) {
              const doc = iframeRef.current.contentDocument;
              if (doc) {
                // 기존 이벤트 리스너 제거
                doc.removeEventListener('click', handleIframeClick);
                doc.removeEventListener('mouseover', handleIframeMouseOver);
                doc.removeEventListener('mouseout', handleIframeMouseOut);

                // 높이 자동 조정
                const body = doc.body;
                const html = doc.documentElement;
                const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                iframeRef.current.style.height = height + 'px';

                // 요소 선택 기능 추가 (최신 콜백 함수 사용)
                doc.addEventListener('click', handleIframeClick);
                doc.addEventListener('mouseover', handleIframeMouseOver);
                doc.addEventListener('mouseout', handleIframeMouseOut);

                // 스타일 업데이트
                updateIframeStyles();
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
