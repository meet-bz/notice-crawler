interface UrlInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
  allowScripts: boolean;
  onToggleScripts: () => void;
  onShowResults: () => void;
  onShowNotification: () => void;
  hasSelectors: boolean;
}

export default function UrlInput({
  url,
  onUrlChange,
  onAnalyze,
  isAnalyzing,
  allowScripts,
  onToggleScripts,
  onShowResults,
  onShowNotification,
  hasSelectors
}: UrlInputProps) {
  const handleAnalyze = () => {
    onAnalyze(url);
  };

  return (
    <div className="mb-4">
      <input
        type="url"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="웹사이트 URL을 입력하세요"
        className="border p-2 w-full mb-2"
      />
      <div className="flex gap-2">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="bg-blue-500 text-white p-2 rounded flex-1"
        >
          {isAnalyzing ? '분석 중...' : '웹사이트 분석'}
        </button>
        <button
          onClick={onToggleScripts}
          className={`p-2 rounded ${allowScripts ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          JavaScript {allowScripts ? '활성화' : '비활성화'}
        </button>
        <button
          onClick={onShowResults}
          disabled={!hasSelectors}
          className="bg-orange-500 text-white p-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          분석 결과 보기
        </button>
        <button
          onClick={onShowNotification}
          disabled={!hasSelectors}
          className="bg-purple-500 text-white p-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          알림 설정
        </button>
      </div>
    </div>
  );
}
