import { useState } from 'react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string) => void;
}

export default function EmailModal({ isOpen, onClose, onSend }: EmailModalProps) {
  const [recipient, setRecipient] = useState('');

  const handleSend = () => {
    if (!recipient) {
      alert('이메일 주소를 입력하세요.');
      return;
    }
    onSend(recipient);
    setRecipient('');
  };

  if (!isOpen) return null;

  return (
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
          <button onClick={onClose} className="mr-2 bg-gray-500 text-white p-2 rounded">
            취소
          </button>
          <button onClick={handleSend} className="bg-blue-500 text-white p-2 rounded">
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
