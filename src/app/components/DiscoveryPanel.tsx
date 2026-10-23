import { X, TrendingUp, Users, Sparkles, Compass, ChevronRight } from 'lucide-react';
import { interestCategories } from './InterestCategories';

interface DiscoveryPanelProps {
  onClose: () => void;
  onCategorySelect: (categoryId: string) => void;
}

export function DiscoveryPanel({ onClose, onCategorySelect }: DiscoveryPanelProps) {
  return (
    <div className="mobile-page">
      <div className="mobile-discovery-panel w-full">
        {/* Header */}
        <div className="sticky top-0 border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="mobile-eyebrow"><Compass size={14}/> FOLLOW YOUR CURIOSITY</p><h1 tabIndex={-1} className="text-[24px] mb-1">Discover Interests</h1>
            <p className="text-sm text-gray-500">Find people who share your passions</p>
          </div>
          <button onClick={onClose} aria-label="Close interest discovery" className="mobile-icon-button">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-3"><p className="mobile-description">{interestCategories.length} categories · Choose a starting point.</p></div>
        {/* Categories */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">Browse all categories</p>
          <div className="space-y-3">
            {interestCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className="mobile-category-card w-full rounded-2xl p-4 flex items-center gap-4 transition-all hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${category.color}22 0%, #22212d 100%)`, border: `1px solid ${category.color}35`
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: category.color + '30' }}
                >
                  {category.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="mb-1">{category.name}</p>
                  <p className="text-xs text-gray-600">
                    {category.subInterests.length} sub-interests
                  </p>
                </div>
                <ChevronRight size={20} style={{color:category.color}} aria-hidden="true"/>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Padding */}
        <div className="h-24" />
      </div>
    </div>
  );
}
