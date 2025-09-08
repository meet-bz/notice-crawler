import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';

interface IframeViewerProps {
  html: string;
  selectors: { [key: string]: string };
  currentMode: string | null;
  allowScripts: boolean;
  onSelectorsChange: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

export default function IframeViewer({
  html,
  selectors,
  currentMode,
  allowScripts,
  onSelectorsChange
}: IframeViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [hoveredSelector, setHoveredSelector] = useState<string>('');

  const colorMap = useMemo<{ [key: string]: string }>(() => ({
    번호: 'blue',
    제목: 'green',
    날짜: 'yellow',
    조회수: 'orange',
    링크: 'purple'
  }), []);

  const getElementSelectedTypes = useCallback((selector: string): string[] => {
    const types: string[] = [];
    for (const [type, sel] of Object.entries(selectors)) {
      if (sel.split(',').map(s => s.trim()).includes(selector)) {
        types.push(type);
      }
    }
    return types;
  }, [selectors]);

  const isElementSelected = useCallback((selector: string): boolean => {
    return Object.values(selectors).some(sel =>
      sel.split(',').map(s => s.trim()).includes(selector)
    );
  }, [selectors]);

  const applyElementBorder = useCallback((element: HTMLElement, selector: string, overrideTypes?: string[]) => {
    const selectedTypes = overrideTypes ?? getElementSelectedTypes(selector);
    if (!selectedTypes || selectedTypes.length === 0) {
      element.style.border = '';
      element.style.boxShadow = '';
      element.removeAttribute('data-original-border');
      element.removeAttribute('data-selected-types');
      element.title = '';
      return;
    }

    const maxBorders = 3;
    const displayTypes = selectedTypes.slice(0, maxBorders);

    // 겹친 테두리를 시각적으로 구분하기 위해 각 타입에 다른 border-width 사용
    const borders: string[] = [];
    displayTypes.forEach((type, idx) => {
      const color = colorMap[type] || 'gray';
      const width = 2 + idx * 2; // 첫 번째: 2px, 두 번째: 4px, 세 번째: 6px
      borders.push(`${width}px solid ${color}`);
    });

    // CSS에서 마지막 border가 적용되므로, 역순으로 추가하여 첫 번째 타입이 가장 바깥에 오게 함
    element.style.border = borders.reverse().join(' ');
    element.style.boxShadow = `0 0 0 1px rgba(0,0,0,0.1)`; // 약간의 그림자 추가
    element.setAttribute('data-selected-types', selectedTypes.join(','));
    element.title = `선택된 타입: ${selectedTypes.join(', ')}`;
  }, [getElementSelectedTypes, colorMap]);

    const combineSelectors = (existing: string, newSelector: string): string => {
    if (!existing) return newSelector;
    const selectors = existing.split(',').map(s => s.trim()).filter(s => s);
    if (!selectors.includes(newSelector)) {
      selectors.push(newSelector);
    }
    const uniqueSelectors = [...new Set(selectors)];
    return uniqueSelectors.join(', ');
  };

  const getSelector = (element: HTMLElement): string => {
    if (!element || !element.tagName) return '';

    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(cls => cls);
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }

    const path: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current.parentElement) {
      if (!current.tagName) break;
      let selector = current.tagName.toLowerCase();

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

      if (path.length > 5) break;
    }

    return path.join(' > ') || (element.tagName ? element.tagName.toLowerCase() : '');
  };

  const getRefinedSelector = (element: HTMLElement): string => {
    if (!element || !element.tagName) return '';

    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(cls => cls);
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }

    const path: string[] = [];
    let current: HTMLElement | null = element;
    let depth = 0;

    while (current && current.parentElement && depth < 8) {
      if (!current.tagName) break;
      let selector = current.tagName.toLowerCase();

      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/).filter(cls => cls);
        if (classes.length > 0) {
          selector += `.${classes[0]}`;
        }
      }

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

      if (depth >= 8) break;
    }

    return path.join(' > ') || (element.tagName ? element.tagName.toLowerCase() : '');
  };

  const handleIframeClick = useCallback((e: Event) => {
    e.preventDefault();
    if (!currentMode) return;

    const target = e.target as HTMLElement;
    if (!target || !target.tagName) return;

    let selector: string;
    if (hoveredElement && (target === hoveredElement || target.contains(hoveredElement) || hoveredElement.contains(target))) {
      selector = hoveredSelector;
    } else {
      selector = getSelector(target);
    }

    if (!selector) return;

    const selectedTypes = getElementSelectedTypes(selector);

    onSelectorsChange(prev => {
      const newSelectors = { ...prev };
      const isSelectedInCurrentMode = newSelectors[currentMode].split(',').map(s => s.trim()).includes(selector);

      if (isSelectedInCurrentMode) {
        const mouseEvent = e as MouseEvent;
        if (mouseEvent.detail === 2 || mouseEvent.ctrlKey) {
          const refinedSelector = getRefinedSelector(target);
          if (refinedSelector !== selector) {
            const currentSelectors = newSelectors[currentMode].split(',').map(s => s.trim()).filter(s => s);
            const newSelectorList = currentSelectors.map(s => s === selector ? refinedSelector : s);
            const uniqueSelectors = [...new Set(newSelectorList)];
            newSelectors[currentMode] = uniqueSelectors.join(', ');
            applyElementBorder(target, refinedSelector);
          }
        } else {
          const currentSelectors = newSelectors[currentMode].split(',').map(s => s.trim()).filter(s => s);
          const newSelectorList = currentSelectors.filter(s => s !== selector);
          newSelectors[currentMode] = newSelectorList.join(', ');

          const remainingTypes = selectedTypes.filter(type => type !== currentMode);
          if (remainingTypes.length > 0) {
            applyElementBorder(target, selector);
          } else {
            target.style.border = '';
            target.style.boxShadow = '';
            target.removeAttribute('data-original-border');
            target.removeAttribute('data-selected-types');
            target.title = '';
          }
        }
      } else {
        const newSelectorString = combineSelectors(newSelectors[currentMode], selector);
        newSelectors[currentMode] = newSelectorString;
        applyElementBorder(target, selector);
      }

      return newSelectors;
    });
  }, [currentMode, hoveredElement, hoveredSelector, getElementSelectedTypes, applyElementBorder, onSelectorsChange]);

  const handleIframeMouseOver = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (!target || !target.tagName) return;

    const selector = getSelector(target);

    if (currentMode && !isElementSelected(selector)) {
      const currentBorder = target.style.border || '';
      const currentBox = target.style.boxShadow || '';
      if (!target.hasAttribute('data-original-border')) {
        target.setAttribute('data-original-border', currentBorder + '||' + currentBox);
      }
      // hover 상태는 현재 모드 색상으로 시각화 (override)
      applyElementBorder(target, selector, [currentMode]);
      setHoveredElement(target);
      setHoveredSelector(selector);
    }
  }, [currentMode, isElementSelected, applyElementBorder]);

  const handleIframeMouseOut = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (!target || !target.tagName) return;

    const selector = getSelector(target);

    if (!isElementSelected(selector)) {
      target.style.border = '';
      target.style.boxShadow = '';
    } else {
      const original = target.getAttribute('data-original-border') || '';
      if (original) {
        const [origBorder, origBox] = original.split('||');
        target.style.border = origBorder || '';
        target.style.boxShadow = origBox || '';
        target.removeAttribute('data-original-border');
      } else {
        applyElementBorder(target, selector);
      }
    }

    setHoveredElement(null);
    setHoveredSelector('');
  }, [isElementSelected, applyElementBorder]);

  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => {
          const element = el as HTMLElement;
          element.style.border = '';
          element.style.boxShadow = '';
          element.removeAttribute('data-original-border');
          element.removeAttribute('data-selected-types');
          element.title = '';
        });

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

        Object.entries(selectorTypeMap).forEach(([selector, types]) => {
          try {
            const elements = doc.querySelectorAll(selector);
            elements.forEach(el => {
              const element = el as HTMLElement;
              applyElementBorder(element, selector, types);
            });
          } catch (e) {
            // 유효하지 않은 셀렉터 무시
          }
        });
      }
    }
  }, [selectors, html, colorMap, currentMode, applyElementBorder]);

  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => {
          const element = el as HTMLElement;
          const originalBorder = element.getAttribute('data-original-border');
          if (originalBorder !== null) {
            const [origBorder, origBox] = originalBorder.split('||');
            element.style.border = origBorder || '';
            element.style.boxShadow = origBox || '';
            element.removeAttribute('data-original-border');
          }
        });

        // 안전하게 리스너를 갱신하기 위해 먼저 제거
        try {
          doc.removeEventListener('click', handleIframeClick);
          doc.removeEventListener('mouseover', handleIframeMouseOver);
          doc.removeEventListener('mouseout', handleIframeMouseOut);
        } catch (e) {
          // ignore
        }

        doc.addEventListener('click', handleIframeClick);
        doc.addEventListener('mouseover', handleIframeMouseOver);
        doc.addEventListener('mouseout', handleIframeMouseOut);

        allElements.forEach(el => {
          const element = el as HTMLElement;
          element.style.border = '';
          element.style.boxShadow = '';
          element.removeAttribute('data-selected-types');
          element.removeAttribute('data-original-border');
          element.title = '';
        });

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

        Object.entries(selectorTypeMap).forEach(([selector, types]) => {
          try {
            const elements = doc.querySelectorAll(selector);
            elements.forEach(el => {
              const element = el as HTMLElement;
              applyElementBorder(element, selector, types);
            });
          } catch (e) {
            // 유효하지 않은 셀렉터 무시
          }
        });

        // cleanup on unmount or html change
        return () => {
          try {
            doc.removeEventListener('click', handleIframeClick);
            doc.removeEventListener('mouseover', handleIframeMouseOver);
            doc.removeEventListener('mouseout', handleIframeMouseOut);
          } catch (e) {
            // ignore
          }
          const els = doc.querySelectorAll('*');
          els.forEach(el => {
            const element = el as HTMLElement;
            element.style.border = '';
            element.style.boxShadow = '';
            element.removeAttribute('data-selected-types');
            element.removeAttribute('data-original-border');
            element.title = '';
          });
        };
      }
    }
  }, [html, handleIframeClick, handleIframeMouseOver, handleIframeMouseOut, selectors, applyElementBorder, currentMode]);

  return (
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
              const body = doc.body;
              const html = doc.documentElement;
              const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
              iframeRef.current.style.height = height + 'px';

              const allElements = doc.querySelectorAll('*');
              allElements.forEach(el => {
                const element = el as HTMLElement;
                element.style.border = '';
                element.style.boxShadow = '';
                element.removeAttribute('data-selected-types');
                element.removeAttribute('data-original-border');
                element.title = '';
              });

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
  );
}
