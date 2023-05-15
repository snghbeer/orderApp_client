import { RecordItem, DataObject } from "../interfaces";

class CartController {
   private cardContent: Map<string, RecordItem | undefined> = new Map<string, RecordItem>();

  addToCart(qty: number, aProduct: DataObject) {
    if(this.cardContent.has(aProduct.name)){
      let item = this.getItem(aProduct.name);
      let newqty = item!.numberOfItems + 1
      item!.numberOfItems = newqty;
      item!.recordTotal = newqty * item!.product.price
      this.cardContent.set(aProduct.name, item);
    } else{
    let cardItem: RecordItem = {
      numberOfItems: qty,
      product: aProduct,
      recordTotal: parseFloat((qty*aProduct.price).toFixed(2))
    };
    this.cardContent.set(aProduct.name, cardItem);
    }

  }

  clearCart(){
    this.cardContent.clear()
  }

  removeFromCart(key: string) {
    this.cardContent.delete(key);

  }

  getItem(key: string) {
    return this.cardContent.get(key);
  }

  updateItem(key: string, qty: number) {
    if(qty === 0) this.removeFromCart(key)
    else {
      let item = this.getItem(key);
      item!.numberOfItems = qty;
      item!.recordTotal = qty * item!.product.price
      this.cardContent.set(key, item);
    }
  }

  toArray() {
    const mappedEntries = Array.from(this.cardContent.entries())
        .map((value) => {
            return value
        });
    return mappedEntries;
  }

  calculateTotal(){
    const sum: number = Array.from(this.cardContent.values())
    .reduce((accumulator: number, currentValue: any) => accumulator + (currentValue.recordTotal as number), 0);
    return sum;
  }

  toRecords() {
    const mappedEntries = Array.from(this.cardContent.entries())
        .map((value) => {
            return {
              product: value[1]?.product.name,
              id: value[1]?.product._id,
              amount: value[1]?.numberOfItems,
              price: value[1]?.product.price
            }
        });
    return mappedEntries;
  }

  isEmpty(){
    return this.cardContent.size === 0
  }
}

export default CartController;
