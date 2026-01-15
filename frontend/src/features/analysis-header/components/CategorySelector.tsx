import React from 'react';
import type { Category } from '../../../entities/market/types/market';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number) => void;
  disabled: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  disabled,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCategoryChange(Number(e.target.value));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-600">분석 업종:</span>
      <select
        className="select select-bordered select-sm w-full max-w-xs"
        value={selectedCategoryId ?? ''}
        onChange={handleChange}
        disabled={disabled || categories.length === 0}
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
};

