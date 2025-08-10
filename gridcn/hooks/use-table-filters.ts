import { useMemo } from 'react';
import { useQueryState, parseAsStringEnum } from 'nuqs';
import { getFiltersStateParser } from '@/lib/parsers';
import type { ExtendedColumnFilter } from '@/types/data-table';

const FILTERS_KEY = "filters";
const JOIN_OPERATOR_KEY = "joinOperator";

export function useTableFilters<TData>(
  columnIds: string[],
  data: Record<string, any>[],
  relatedDataLookup?: Record<string, Record<string, any>[]>
) {
  // Read filter state from URL
  const [filters] = useQueryState(
    FILTERS_KEY,
    getFiltersStateParser<TData>(columnIds)
      .withDefault([])
      .withOptions({
        clearOnDefault: true,
        shallow: true,
      }),
  );

  const [joinOperator] = useQueryState(
    JOIN_OPERATOR_KEY,
    parseAsStringEnum(["and", "or"]).withDefault("and").withOptions({
      clearOnDefault: true,
      shallow: true,
    }),
  );

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (!filters || filters.length === 0) return data;

    return data.filter((row) => {
      const filterResults = filters.map((filter) => {
        return applyFilter(row, filter, relatedDataLookup);
      });

      // Apply join operator
      if (joinOperator === 'or') {
        return filterResults.some(result => result);
      } else {
        return filterResults.every(result => result);
      }
    });
  }, [data, filters, joinOperator, relatedDataLookup]);

  return {
    filters: filters || [],
    joinOperator,
    filteredData,
  };
}

function applyFilter(
  row: Record<string, any>, 
  filter: ExtendedColumnFilter<any>,
  relatedDataLookup?: Record<string, Record<string, any>[]>
): boolean {
  const { id, value, operator, variant } = filter;
  const fieldValue = row[id];

  // Handle empty/not empty operators
  if (operator === 'isEmpty') {
    return fieldValue == null || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0);
  }
  if (operator === 'isNotEmpty') {
    return fieldValue != null && fieldValue !== '' && (!Array.isArray(fieldValue) || fieldValue.length > 0);
  }

  // If filter value is empty, don't filter
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return true;
  }

  // For select/multiSelect variants, compare directly with field value (usually IDs)
  // For other variants, we might want to get display values for text comparison
  let compareValue = fieldValue;
  
  if (variant !== 'select' && variant !== 'multiSelect' && typeof fieldValue === 'string' && relatedDataLookup) {
    // For text search on relation fields, get display value
    for (const [tableName, tableData] of Object.entries(relatedDataLookup)) {
      const relatedItem = tableData.find((item: any) => item._id === fieldValue);
      if (relatedItem) {
        // Use a reasonable display field or fallback to _id
        const displayFields = ['name', 'title', 'label', 'displayName', '_id'];
        for (const field of displayFields) {
          if (relatedItem[field]) {
            compareValue = String(relatedItem[field]);
            break;
          }
        }
        break;
      }
    }
  }

  // Ensure we have strings for text operations
  const stringFieldValue = String(compareValue || '').toLowerCase();
  const stringFilterValue = String(value || '').toLowerCase();

  switch (operator) {
    case 'eq':
      if (variant === 'boolean') {
        return Boolean(fieldValue) === (stringFilterValue === 'true');
      }
      if (variant === 'number') {
        return Number(fieldValue) === Number(value);
      }
      return stringFieldValue === stringFilterValue;

    case 'ne':
      if (variant === 'boolean') {
        return Boolean(fieldValue) !== (stringFilterValue === 'true');
      }
      if (variant === 'number') {
        return Number(fieldValue) !== Number(value);
      }
      return stringFieldValue !== stringFilterValue;

    case 'iLike':
      return stringFieldValue.includes(stringFilterValue);

    case 'notILike':
      return !stringFieldValue.includes(stringFilterValue);

    case 'gt':
      if (variant === 'number') {
        return Number(fieldValue) > Number(value);
      }
      return stringFieldValue > stringFilterValue;

    case 'gte':
      if (variant === 'number') {
        return Number(fieldValue) >= Number(value);
      }
      return stringFieldValue >= stringFilterValue;

    case 'lt':
      if (variant === 'number') {
        return Number(fieldValue) < Number(value);
      }
      return stringFieldValue < stringFilterValue;

    case 'lte':
      if (variant === 'number') {
        return Number(fieldValue) <= Number(value);
      }
      return stringFieldValue <= stringFilterValue;

    case 'inArray':
      if (Array.isArray(value)) {
        if (Array.isArray(fieldValue)) {
          return fieldValue.some(item => value.includes(String(item)));
        }
        return value.includes(String(fieldValue));
      }
      return false;

    case 'notInArray':
      if (Array.isArray(value)) {
        if (Array.isArray(fieldValue)) {
          return !fieldValue.some(item => value.includes(String(item)));
        }
        return !value.includes(String(fieldValue));
      }
      return true;

    case 'isBetween':
      if (Array.isArray(value) && value.length === 2) {
        const [min, max] = value.map(v => Number(v));
        const numValue = Number(fieldValue);
        return numValue >= min && numValue <= max;
      }
      return false;

    case 'isRelativeToToday':
      // TODO: Implement relative date logic if needed
      return true;

    default:
      console.warn(`Unknown filter operator: ${operator}`);
      return true;
  }
}
