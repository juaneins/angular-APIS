import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { zip } from 'rxjs';

import { Product } from '../../models/product.model';
import {
  CreateProductDTO,
  UpdateProductDTO,
} from '../../models/productdto.model';

import { StoreService } from '../../services/store.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  myShoppingCart: Product[] = [];
  total = 0;
  products: Product[] = [];
  showProductDetail: boolean = false;
  productChosen: Product = {
    id: '',
    price: 0,
    images: [],
    title: '',
    category: {
      id: '',
      name: '',
    },
    description: '',
  };
  limit = 10;
  offset = 0;
  statusDetail: 'loading' | 'success' | 'error' | 'init' = 'init';

  constructor(
    private storeService: StoreService,
    private productsService: ProductsService
  ) {
    this.myShoppingCart = this.storeService.getShoppingCart();
  }

  ngOnInit(): void {
    this.productsService
      .getAllProducts(10, 0)
      //this.productsService.getProductsByPage(10, 0)
      .subscribe((data) => {
        this.products = data;
        this.offset += this.limit;
      });
  }

  onAddToShoppingCart(product: Product) {
    this.storeService.addProduct(product);
    this.total = this.storeService.getTotal();
  }

  toggleProductDetail() {
    this.showProductDetail = !this.showProductDetail;
  }

  onShowDetail(id: string) {
    this.statusDetail = 'loading';
    this.productsService.getProduct(id).subscribe(
      (data) => {
        console.log('product: ', data);
        this.toggleProductDetail();
        this.productChosen = data;
        this.statusDetail = 'success';
      },
      (errorMesage) => {
        window.alert(errorMesage);
        this.statusDetail = 'error';
      }
    );
  }
  /*switchmap se usa para ejecutar observables que dependen de un resultado anterior; en el ejemplo primero se necesita el id para la actualización
  Con switchMap evitamos el callback hell, si tenemos varias llamadas
se podrían ejecutar los observables usando otro switchmap:
 switchMap((product) =>this.productsService.update(product.id, { title: 'new title' }),
 switchMap((product) =>this.productsService.update(product.id, { title: 'new title' }),
 switchMap((product) =>this.productsService.update(product.id, { title: 'new title' }),
        )


        */
  readAndUpdate(id: string) {
    this.productsService
      .getProduct(id)
      .pipe(
        switchMap((product) =>
          this.productsService.update(product.id, { title: 'new title' })
        )
      )
      .subscribe((data) => {
        console.log('data: ', data);
      });

    // .subscribe((data) => {
    //   const productId = data.id;
    //   this.productsService
    //     .update(productId, {
    //       title: 'new title',
    //     })
    // .subscribe((rtaUpdate) => {
    //   console.log(rtaUpdate);
    // });
    /*
    con zip podemos ejecutar observables paralelos que no son dependientes al mismo tiempo
    */
    zip(
      // this.productsService.getProduct(id),
      // this.productsService.update(id, { title: 'new title' })
      this.productsService.fetchReadAndUpdate(id, { title: 'new title' })
    ).subscribe((response) => {
      const read = response[0];
      const update = response[1];
    });
  }

  createNewProduct() {
    const newProduct: CreateProductDTO = {
      price: 100,
      images: [`https://placeimg.com/640/480/any?random=${Math.random()}`],
      title: 'Nuevo producto',
      categoryId: 2,
      description: 'description',
    };
    this.productsService.create(newProduct).subscribe((data) => {
      this.products.unshift(data);
    });
  }

  updateProduct() {
    const changes: UpdateProductDTO = {
      title: 'Nuevo titulo',
    };
    const id = this.productChosen.id;
    this.productsService.update(id, changes).subscribe((data) => {
      const productIndex = this.products.findIndex(
        (item) => item.id === this.productChosen.id
      );
      this.products[productIndex] = data;
      this.productChosen = data;
    });
  }

  deleteProduct() {
    const id = this.productChosen.id;
    this.productsService.delete(id).subscribe(() => {
      const productIndex = this.products.findIndex(
        (item) => item.id === this.productChosen.id
      );
      this.products.splice(productIndex, 1);
      this.showProductDetail = false;
    });
  }

  loadMore() {
    this.productsService
      .getProductsByPage(this.limit, this.offset)
      .subscribe((data) => {
        this.products = this.products.concat(data);
        this.offset += this.limit;
      });
  }
}
