import { LoadingCard } from "@/components/ui/LoadingSpinner";

export default function DatabaseLoading() {
  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      <div className="animate-pulse mb-8">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-64"></div>
      </div>
      
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    </div>
  );
}
