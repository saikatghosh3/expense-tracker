import React from 'react';
import { getCategoryBadge, getCategoryIcon } from '../../constants/categories';

interface CategoryBadgeProps {
  category: string;
  /** Prefixes the category emoji. */
  withIcon?: boolean;
  /** Tighter padding for dense list rows. */
  dense?: boolean;
  /** Replaces the default label, e.g. to append an amount. */
  children?: React.ReactNode;
  className?: string;
}

/** Category pill shared by expense lists and the budget category summary. */
const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  withIcon = false,
  dense = false,
  children,
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1 border text-xs font-medium ${
      dense ? 'px-2 py-1 w-fit' : 'px-2.5 py-1'
    } rounded-lg ${getCategoryBadge(category)} ${className}`}
  >
    {withIcon && (
      <span aria-hidden="true" className="flex-shrink-0">
        {getCategoryIcon(category)}
      </span>
    )}
    {children ?? category}
  </span>
);

export default CategoryBadge;