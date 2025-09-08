interface UrlInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
  allowScripts: boolean;
  onToggleScripts: () => void;
}

export default function UrlInput({
  url,
  onUrlChange,
  onAnalyze,
  isAnalyzing,
  allowScripts,
  onToggleScripts
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
      </div>
    </div>
  );
}
