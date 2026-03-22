export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="border rounded-lg p-6 mb-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="flex gap-2">
        <div className="h-2 bg-gray-200 rounded w-16"></div>
        <div className="h-2 bg-gray-200 rounded w-16"></div>
        <div className="h-2 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
  );
}
