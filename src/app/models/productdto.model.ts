import { Product } from './product.model';

export interface ProductDTO extends Omit<Product, 'id' | 'category'> {
  categoryId: number;
}
