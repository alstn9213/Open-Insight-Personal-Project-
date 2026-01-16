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
    <select
      className="select select-bordered select-sm w-48"
      value={selectedCategoryId ?? ''}
      onChange={handleChange}
      disabled={disabled || categories.length === 0}
    >
      <option disabled value="">
        업종 선택
      </option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
};

