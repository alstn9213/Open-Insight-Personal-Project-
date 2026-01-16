import React from 'react';
import type { Category } from '../../../entities/market/types/market';
import { CategorySelector } from './CategorySelector';

interface AnalysisHeaderProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number) => void;
  disabled: boolean;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  disabled,
}) => {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        🗺️ 상권 분석
      </h1>
      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
        <CategorySelector
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={onCategoryChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
