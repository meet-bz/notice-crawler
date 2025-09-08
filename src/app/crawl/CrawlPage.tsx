'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import UrlInput from '../../components/UrlInput';
import SelectorInput from '../../components/SelectorInput';
import IframeViewer from '../../components/IframeViewer';
import ExtractedData from '../../components/ExtractedData';
import EmailModal from '../../components/EmailModal';
import ResultsModal from '../../components/ResultsModal';

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
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [allowScripts, setAllowScripts] = useState(false);
  const [isCrawlingForModal, setIsCrawlingForModal] = useState(false);
  const [extractedData, setExtractedData] = useState<{ [key: string]: string }>({});

  useEffect(() => {
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

  const handleCrawl = async () => {
    const activeSelectors = Object.entries(selectors).filter(([type, sel]) => sel.trim() !== '');
    if (activeSelectors.length === 0) {
      alert('요소를 선택하세요.');
      return;
    }

    setIsCrawling(true);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl, selectors: Object.fromEntries(activeSelectors) }),
      });
      const data = await res.json();
      if (data.content) {
        setExtractedData(data.content);
      } else {
        alert('크롤링 실패: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (err) {
      alert('크롤링 중 오류 발생: ' + (err as Error).message);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleCrawlForModal = async () => {
    const activeSelectors = Object.entries(selectors).filter(([type, sel]) => sel.trim() !== '');
    if (activeSelectors.length === 0) {
      alert('요소를 선택하세요.');
      return;
    }

    setIsCrawlingForModal(true);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl, selectors: Object.fromEntries(activeSelectors) }),
      });
      const data = await res.json();
      if (data.content) {
        setExtractedData(data.content);
      } else {
        alert('크롤링 실패: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (err) {
      alert('크롤링 중 오류 발생: ' + (err as Error).message);
    } finally {
      setIsCrawlingForModal(false);
    }
  };

  const handleShowResults = () => {
    setShowResultsModal(true);
    handleCrawlForModal();
  };

  const handleSend = async (recipient: string) => {
    if (!extractedData || Object.keys(extractedData).length === 0) {
      alert('먼저 크롤링을 수행해주세요.');
      return;
    }

    const sendRes = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: extractedData, url: inputUrl, email: recipient }),
    });
    if (sendRes.ok) {
      alert('알림이 전송되었습니다.');
      setShowModal(false);
    } else {
      alert('전송 실패');
    }
  };

  const updateSelector = useCallback((type: string, selector: string) => {
    setSelectors(prev => ({ ...prev, [type]: selector }));
  }, []);

  const hasSelectors = Object.values(selectors).some(s => s.trim() !== '');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">공지사항 크롤러</h1>

      <UrlInput
        url={inputUrl}
        onUrlChange={setInputUrl}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        allowScripts={allowScripts}
        onToggleScripts={() => setAllowScripts(!allowScripts)}
        onShowResults={handleShowResults}
        onShowNotification={() => setShowModal(true)}
        hasSelectors={hasSelectors}
      />

      <SelectorInput
        selectors={selectors}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        onSelectorChange={updateSelector}
      />

      <IframeViewer
        html={html}
        selectors={selectors}
        currentMode={currentMode}
        allowScripts={allowScripts}
        onSelectorsChange={setSelectors}
      />

      <ExtractedData data={extractedData} />

      <ResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        data={extractedData}
        isLoading={isCrawlingForModal}
        onCrawl={handleCrawl}
      />

      <EmailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSend={handleSend}
      />
    </div>
  );
}
