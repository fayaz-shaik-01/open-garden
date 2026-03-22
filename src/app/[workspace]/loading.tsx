import { LoadingCard } from "@/components/ui/LoadingSpinner";

export default function WorkspaceLoading() {
  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      <div className="animate-pulse mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gray-200"></div>
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
      
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    </div>
  );
}
