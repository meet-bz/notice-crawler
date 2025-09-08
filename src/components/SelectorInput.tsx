import { useCallback } from 'react';

interface SelectorInputProps {
  selectors: { [key: string]: string };
  currentMode: string | null;
  onModeChange: (mode: string) => void;
  onSelectorChange: (type: string, selector: string) => void;
}

const colorMap = {
  번호: 'bg-blue-500',
  제목: 'bg-green-500',
  날짜: 'bg-yellow-500',
  조회수: 'bg-orange-500',
  링크: 'bg-purple-500'
};

export default function SelectorInput({
  selectors,
  currentMode,
  onModeChange,
  onSelectorChange
}: SelectorInputProps) {
  const handleSelectorChange = useCallback((type: string, value: string) => {
    onSelectorChange(type, value);
  }, [onSelectorChange]);

  return (
    <div className="mb-4">
      {Object.entries(selectors).map(([type, selector]) => (
        <div key={type} className="flex items-center mb-2">
          <button
            onClick={() => onModeChange(type)}
            className={`p-2 rounded mr-2 whitespace-nowrap ${
              currentMode === type
                ? `${colorMap[type as keyof typeof colorMap]} text-white`
                : 'bg-gray-200'
            }`}
          >
            {type} 선택
          </button>
          <input
            type="text"
            value={selector}
            onChange={(e) => handleSelectorChange(type, e.target.value)}
            placeholder="CSS Selector 입력"
            className="border p-2 flex-1"
          />
        </div>
      ))}
    </div>
  );
}
