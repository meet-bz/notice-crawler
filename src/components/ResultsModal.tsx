interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { [key: string]: string };
  isLoading: boolean;
  onCrawl: () => void;
}

export default function ResultsModal({ isOpen, onClose, data, isLoading, onCrawl }: ResultsModalProps) {
  if (!isOpen) return null;

  const handleCrawlAndShow = async () => {
    await onCrawl();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">크롤링 분석 결과</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">크롤링 중...</p>
          </div>
        ) : Object.keys(data).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(data).map(([type, value]) => (
              <div key={type} className="border rounded-lg p-4">
                <div className="font-semibold text-lg mb-2 text-gray-800">
                  {type}
                </div>
                <div className="text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                  {value}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">아직 크롤링 결과가 없습니다.</p>
            <button
              onClick={handleCrawlAndShow}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              크롤링 실행
            </button>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
