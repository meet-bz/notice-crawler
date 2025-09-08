'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

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
  const colorMap = useMemo<{ [key: string]: string }>(() => ({
    번호: 'blue',
    제목: 'green',
    날짜: 'yellow',
    조회수: 'orange',
    링크: 'purple'
  }), []);
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

  const getElementSelectedTypes = useCallback((selector: string): string[] => {
    const types: string[] = [];
    for (const [type, sel] of Object.entries(selectors)) {
      if (sel.split(',').map(s => s.trim()).includes(selector)) {
        types.push(type);
      }
    }
    return types;
  }, [selectors]);

  const getElementSelectedType = useCallback((selector: string): string | null => {
    const types = getElementSelectedTypes(selector);
    return types.length > 0 ? types[0] : null;
  }, [getElementSelectedTypes]);

  const isElementSelected = useCallback((selector: string): boolean => {
    return Object.values(selectors).some(sel =>
      sel.split(',').map(s => s.trim()).includes(selector)
    );
  }, [selectors]);

  const applyElementBorder = useCallback((element: HTMLElement, selector: string) => {
    const selectedTypes = getElementSelectedTypes(selector);
    if (selectedTypes.length === 0) {
      element.style.border = '';
      element.removeAttribute('data-original-border');
      element.removeAttribute('data-selected-types');
      return;
    }

    // 다중 선택 시 테두리 중첩 (최대 3개까지)
    const maxBorders = 3;
    const displayTypes = selectedTypes.slice(0, maxBorders);
    const borders = displayTypes.map(type => `2px solid ${colorMap[type] || 'gray'}`);

    element.style.border = borders.join(' ');
    element.setAttribute('data-selected-types', selectedTypes.join(','));

    // 선택된 타입 정보 표시 (툴팁)
    element.title = `선택된 타입: ${selectedTypes.join(', ')}`;
  }, [getElementSelectedTypes, colorMap]);

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
      const others = selectors.filter(s => !s.includes(' ') || !s.startsWith('.'));
      return [...optimized, ...others];
    }

    return selectors;
  };

  const optimizeNthChildSelectors = (selectors: string[]): string[] => {
    const parentMap: { [key: string]: number[] } = {};

    selectors.forEach(selector => {
      const match = selector.match(/^(.+):nth-child\((\d+)\)$/);
      if (match) {
        const parent = match[1];
        const index = parseInt(match[2]);
        if (!parentMap[parent]) parentMap[parent] = [];
        parentMap[parent].push(index);
      }
    });

    const optimized: string[] = [];
    for (const [parent, indices] of Object.entries(parentMap)) {
      if (indices.length > 1) {
        // 연속된 인덱스 그룹화
        indices.sort((a, b) => a - b);
        const groups: number[][] = [];
        let currentGroup: number[] = [indices[0]];

        for (let i = 1; i < indices.length; i++) {
          if (indices[i] === currentGroup[currentGroup.length - 1] + 1) {
            currentGroup.push(indices[i]);
          } else {
            groups.push(currentGroup);
            currentGroup = [indices[i]];
          }
        }
        groups.push(currentGroup);

        groups.forEach(group => {
          if (group.length === 1) {
            optimized.push(`${parent}:nth-child(${group[0]})`);
          } else if (group.length === 2) {
            optimized.push(`${parent}:nth-child(${group[0]}), ${parent}:nth-child(${group[1]})`);
          } else {
            optimized.push(`${parent}:nth-child(n+${group[0]}):nth-child(-n+${group[group.length - 1]})`);
          }
        });
      } else {
        optimized.push(`${parent}:nth-child(${indices[0]})`);
      }
    }

    return optimized;
  };

  const optimizeClassSelectors = (selectors: string[]): string[] => {
    // 같은 클래스를 공유하는 요소들 그룹화
    const classMap: { [key: string]: string[] } = {};
    selectors.forEach(selector => {
      if (!classMap[selector]) classMap[selector] = [];
      classMap[selector].push(selector);
    });

    const optimized: string[] = [];
    for (const [className, instances] of Object.entries(classMap)) {
      if (instances.length > 1) {
        optimized.push(className);
      } else {
        optimized.push(...instances);
      }
    }

    return optimized;
  };

  const handleIframeClick = useCallback((e: Event) => {
    e.preventDefault();
    if (!currentMode) return;
    const target = e.target as HTMLElement;
    const selector = getSelector(target);
    const selectedTypes = getElementSelectedTypes(selector);

    setSelectors(prev => {
      const currentSelectors = prev[currentMode].split(',').map(s => s.trim()).filter(s => s);

      if (selectedTypes.includes(currentMode)) {
        // 현재 모드로 이미 선택된 경우 - 선택 해제 또는 세부요소 선택 강화
        const mouseEvent = e as MouseEvent;
        if (mouseEvent.detail === 2 || mouseEvent.ctrlKey) { // 더블클릭 또는 Ctrl+클릭으로 세부요소 선택 강화
          const refinedSelector = getRefinedSelector(target);
          if (refinedSelector !== selector) {
            const newSelectors = currentSelectors.map(s => s === selector ? refinedSelector : s);
            // 중복 제거
            const uniqueSelectors = [...new Set(newSelectors)];
            applyElementBorder(target, refinedSelector);
            return {
              ...prev,
              [currentMode]: uniqueSelectors.join(', ')
            };
          }
        }

        // 일반 클릭 - 현재 모드에서 선택 해제
        const newSelectors = currentSelectors.filter(s => s !== selector);
        const remainingTypes = selectedTypes.filter(type => type !== currentMode);
        if (remainingTypes.length > 0) {
          // 다른 타입으로 여전히 선택되어 있음
          applyElementBorder(target, selector);
        } else {
          // 완전히 선택 해제
          target.style.border = '';
          target.removeAttribute('data-original-border');
        }
        return {
          ...prev,
          [currentMode]: newSelectors.join(', ')
        };
      } else {
        // 현재 모드로 선택되지 않은 경우 - 추가 (중복 방지)
        const newSelectorString = combineSelectors(prev[currentMode], selector);
        applyElementBorder(target, selector);
        return {
          ...prev,
          [currentMode]: newSelectorString
        };
      }
    });
  }, [currentMode, getElementSelectedTypes, applyElementBorder, combineSelectors]);

  const handleIframeMouseOver = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const selector = getSelector(target);

    // 현재 선택 모드가 있고, 아직 선택되지 않은 요소만 호버링
    if (currentMode && !isElementSelected(selector)) {
      // 호버링 전 원래 테두리 색상 저장 (없는 경우에만)
      const currentBorder = target.style.border;
      if (!target.hasAttribute('data-original-border')) {
        target.setAttribute('data-original-border', currentBorder);
      }
      target.style.border = `2px solid ${colorMap[currentMode] || 'gray'}`;
    }
  }, [currentMode, isElementSelected, colorMap]);

  const handleIframeMouseOut = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const selector = getSelector(target);

    if (!isElementSelected(selector)) {
      // 선택되지 않은 요소는 테두리 제거
      target.style.border = '';
    } else {
      // 선택된 요소는 원래 테두리 색상으로 복원
      const originalBorder = target.getAttribute('data-original-border') || '';
      if (originalBorder) {
        target.style.border = originalBorder;
      } else {
        // 원래 테두리가 없으면 선택된 타입의 색상으로 설정
        applyElementBorder(target, selector);
      }
    }
  }, [isElementSelected, applyElementBorder]);

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

  // 선택 모드 변경 시 iframe 이벤트 리스너 업데이트 (최적화)
  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        // 호버링 상태 초기화 - 모든 요소의 data-original-border 속성 제거
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => {
          const element = el as HTMLElement;
          const originalBorder = element.getAttribute('data-original-border');
          if (originalBorder !== null) {
            element.style.border = originalBorder;
            element.removeAttribute('data-original-border');
          }
        });

        // 콜백 함수가 변경되었으므로 이벤트 리스너를 업데이트
        // 기존 리스너 제거 후 새 리스너 추가
        doc.removeEventListener('click', handleIframeClick);
        doc.removeEventListener('mouseover', handleIframeMouseOver);
        doc.removeEventListener('mouseout', handleIframeMouseOut);

        doc.addEventListener('click', handleIframeClick);
        doc.addEventListener('mouseover', handleIframeMouseOver);
        doc.addEventListener('mouseout', handleIframeMouseOut);

        // 스타일 업데이트 (직접 실행)
        // 모든 요소의 테두리와 데이터 속성 초기화
        allElements.forEach(el => {
          const element = el as HTMLElement;
          element.style.border = '';
          element.removeAttribute('data-selected-types');
          element.removeAttribute('data-original-border');
          element.title = '';
        });

        // 각 셀렉터별로 선택된 타입들을 수집
        const selectorTypeMap: { [selector: string]: string[] } = {};

        Object.entries(selectors).forEach(([type, sel]) => {
          if (sel) {
            const selectorList = sel.split(',').map(s => s.trim()).filter(s => s);
            selectorList.forEach(selector => {
              if (!selectorTypeMap[selector]) {
                selectorTypeMap[selector] = [];
              }
              selectorTypeMap[selector].push(type);
            });
          }
        });

        // 각 셀렉터에 대해 테두리 적용
        Object.entries(selectorTypeMap).forEach(([selector, types]) => {
          try {
            const elements = doc.querySelectorAll(selector);
            elements.forEach(el => {
              const element = el as HTMLElement;
              applyElementBorder(element, selector);
            });
          } catch (e) {
            // 유효하지 않은 셀렉터 무시
          }
        });
      }
    }
  }, [html, handleIframeClick, handleIframeMouseOver, handleIframeMouseOut, selectors, applyElementBorder]);

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

  const getRefinedSelector = (element: HTMLElement): string => {
    // 더 구체적인 셀렉터 생성
    if (element.id) {
      return `#${element.id}`;
    }

    // 클래스와 태그네임 조합
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(cls => cls);
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }

    // 부모 요소 정보를 포함한 더 구체적인 경로 생성
    const path: string[] = [];
    let current: HTMLElement | null = element;
    let depth = 0;

    while (current && current.parentElement && depth < 8) { // 더 깊은 경로 허용
      let selector = current.tagName.toLowerCase();

      // 클래스 정보 추가
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/).filter(cls => cls);
        if (classes.length > 0) {
          selector += `.${classes[0]}`; // 첫 번째 클래스만 사용
        }
      }

      // 형제 요소들 중에서 몇 번째인지 확인
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current);
        const sameTagSiblings = siblings.filter(sibling =>
          (sibling as HTMLElement).tagName === current!.tagName
        );

        if (sameTagSiblings.length > 1) {
          selector += `:nth-child(${index + 1})`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;
      depth++;

      // 너무 깊어지지 않도록 제한 (원래보다 더 깊게)
      if (depth >= 8) break;
    }

    return path.join(' > ') || element.tagName.toLowerCase();
  };

  const updateIframeStyles = useCallback(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        // 모든 요소의 테두리와 데이터 속성 초기화
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => {
          const element = el as HTMLElement;
          element.style.border = '';
          element.removeAttribute('data-selected-types');
          element.removeAttribute('data-original-border');
          element.title = '';
        });

        // 각 셀렉터별로 선택된 타입들을 수집
        const selectorTypeMap: { [selector: string]: string[] } = {};

        Object.entries(selectors).forEach(([type, sel]) => {
          if (sel) {
            const selectorList = sel.split(',').map(s => s.trim()).filter(s => s);
            selectorList.forEach(selector => {
              if (!selectorTypeMap[selector]) {
                selectorTypeMap[selector] = [];
              }
              selectorTypeMap[selector].push(type);
            });
          }
        });

        // 각 셀렉터에 대해 테두리 적용
        Object.entries(selectorTypeMap).forEach(([selector, types]) => {
          try {
            const elements = doc.querySelectorAll(selector);
            elements.forEach(el => {
              const element = el as HTMLElement;
              applyElementBorder(element, selector);
            });
          } catch (e) {
            // 유효하지 않은 셀렉터 무시
          }
        });
      }
    }
  }, [html, selectors, applyElementBorder]);

  const updateSelector = useCallback((type: string, selector: string) => {
    setSelectors(prev => ({ ...prev, [type]: selector }));
    // CSS 변경 시 iframe 내 요소들 스타일 업데이트
    setTimeout(() => updateIframeStyles(), 0);
  }, [updateIframeStyles]);

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
        {Object.entries(selectors).map(([type, selector]) => (
          <div key={type} className="flex items-center mb-2">
            <button
              onClick={() => setCurrentMode(type)}
              className={`p-2 rounded mr-2 whitespace-nowrap ${
                currentMode === type
                  ? type === '번호' ? 'bg-blue-500 text-white'
                  : type === '제목' ? 'bg-green-500 text-white'
                  : type === '날짜' ? 'bg-yellow-500 text-white'
                  : type === '조회수' ? 'bg-orange-500 text-white'
                  : 'bg-purple-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {type}
            </button>
            <input
              type="text"
              value={selector}
              onChange={(e) => updateSelector(type, e.target.value)}
              placeholder="CSS Selector 입력"
              className="border p-2 flex-1"
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
                // 높이 자동 조정
                const body = doc.body;
                const html = doc.documentElement;
                const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                iframeRef.current.style.height = height + 'px';

                // 스타일 업데이트 (직접 실행)
                const allElements = doc.querySelectorAll('*');
                allElements.forEach(el => {
                  const element = el as HTMLElement;
                  element.style.border = '';
                  element.removeAttribute('data-selected-types');
                  element.removeAttribute('data-original-border');
                  element.title = '';
                });

                // 각 셀렉터별로 선택된 타입들을 수집
                const selectorTypeMap: { [selector: string]: string[] } = {};

                Object.entries(selectors).forEach(([type, sel]) => {
                  if (sel) {
                    const selectorList = sel.split(',').map(s => s.trim()).filter(s => s);
                    selectorList.forEach(selector => {
                      if (!selectorTypeMap[selector]) {
                        selectorTypeMap[selector] = [];
                      }
                      selectorTypeMap[selector].push(type);
                    });
                  }
                });

                // 각 셀렉터에 대해 테두리 적용
                Object.entries(selectorTypeMap).forEach(([selector, types]) => {
                  try {
                    const elements = doc.querySelectorAll(selector);
                    elements.forEach(el => {
                      const element = el as HTMLElement;
                      applyElementBorder(element, selector);
                    });
                  } catch (e) {
                    // 유효하지 않은 셀렉터 무시
                  }
                });
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
