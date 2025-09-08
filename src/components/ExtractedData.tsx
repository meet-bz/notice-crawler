interface ExtractedDataProps {
  data: { [key: string]: string };
}

export default function ExtractedData({ data }: ExtractedDataProps) {
  if (Object.keys(data).length === 0) {
    return null;
  }

  return (
    <div className="border p-4 mt-4">
      <h2 className="text-lg font-bold mb-4">추출된 데이터</h2>
      {Object.entries(data).map(([type, value]) => (
        <div key={type} className="mb-2">
          <strong>{type}:</strong> {value}
        </div>
      ))}
    </div>
  );
}
