import { DiscoveredProduct } from '@/domain/catalog/discovery-types';
import { DEMO_PRODUCTS_PART1 } from './discovery-fixtures-part1';
import { DEMO_PRODUCTS_PART2 } from './discovery-fixtures-part2';

export const DEMO_DISCOVERY_PRODUCTS: DiscoveredProduct[] = [
  ...DEMO_PRODUCTS_PART1,
  ...DEMO_PRODUCTS_PART2,
];
