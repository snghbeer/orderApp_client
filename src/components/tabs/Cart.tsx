import { useState, useEffect, useContext } from "react";
import {
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonCol,
  IonGrid,
  IonRow,
  IonInput,
  IonIcon,
  IonToast,
  IonContent, useIonAlert
} from "@ionic/react";
import { CartPropItems } from "../interfaces/interfaces";
import { trashOutline } from "ionicons/icons";
import { apiUrl } from "../../config";
import CartContext from "../util/CartContext";

const Cart = (props: CartPropItems) => {
  const { updated, setUpdated } = useContext(CartContext);

  const [total, setTotal] = useState(0);
  const [registerSucces, setSucces] = useState(false);
  const [presentAlert] = useIonAlert();

  async function validateCart(){
    if (!props.cart.isEmpty()){
      const url = apiUrl + "/product_manager/product/sell";
      const records = props.cart.toRecords()
      let record = {
        total: total.toFixed(2),
        items: records
      }
        await fetch(url, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + props.user?.token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            data: record
          }),
        }).then(res => res.json())
        .then(data => {
          console.log(data)
          if(data.succes){
            setSucces(true)
            props.cart.clearCart()
          }
        })
        .catch(err => console.log(err)) 
    }
    else {
      presentAlert({
        cssClass: "custom-alert",
        header: 'Your cart is empty',
        message: 'To validate your order you need to order something',
        buttons: ['OK'],
      })
    }
  }

  async function removeFromCart(aProductName: string) {
    props.cart.removeFromCart(aProductName);
    props.setUpdated!(true);
  }

  async function updateAmount(aProductName: string, amount: number) {
    props.cart.updateItem(aProductName, amount);
    props.setUpdated!(true);
  }

  function calculateTotal() {
    return props.cart.calculateTotal();
  }

  useEffect(() => {
    setTotal(calculateTotal());
  }, []);

  useEffect(() => {
    if (updated) {
      //props.setUpdated!(false);
      setUpdated!()
      setTotal(calculateTotal());
    }
  }, [updated]);

  useEffect(() => {
    if (registerSucces) {
      setTotal(calculateTotal());
    }
  }, [registerSucces]);

  return (
    <IonContent>
       <IonToast
          isOpen={registerSucces}
          position="top"
          message="Your order has been processed successfully!"
          duration={3000}
          onDidDismiss={() => setSucces(false)}
          buttons={[
            {
              text: "Dismiss",
              role: "cancel",
            },
          ]}
        />
      <IonCard  class="ion-margin-top">
        <IonCardHeader>
          <IonCardTitle>Checkout</IonCardTitle>
        </IonCardHeader>
      </IonCard>
      <IonList inset>
        <IonGrid>
          <IonRow class="tableheader">
            <IonCol size="2"></IonCol>
            <IonCol size="8" sizeXs="5" class="ion-padding-start">
                <b>Order</b>
            </IonCol>
            <IonCol size="3" class= {window.innerWidth > 400 ? "ion-text-center" : "ion-text-start"} >
                <b>{window.innerWidth > 400 ? "Quantity" : "Qty."}</b>
            </IonCol>
            <IonCol size="1"></IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid>
          {props.cart.toArray()!.map((item, index) => {
            return (
              <IonItem button key={index}>
                <IonCol size="2"> <img src={item[1]!.product.image} className="avatar" alt="avatar" /></IonCol>
                <IonCol size="8" sizeXs="5">
                  <IonLabel>{item[1]!.product.name}</IonLabel>
                </IonCol>
                <IonCol size="3" class="ion-text-center">
                  <IonInput
                    type="number"
                    min={1}
                    value={item[1]!.numberOfItems}
                    onIonBlur={(ev) => {
                      updateAmount(item[1]!.product.name, +ev.target.value!);
                    }}
                  ></IonInput>
                </IonCol>
                <IonCol class="ion-text-end" >
                  <IonIcon
                    onClick={() => removeFromCart(item[1]!.product.name)}
                    size={'large'}
                    icon={trashOutline}
                  ></IonIcon>
                </IonCol>
              </IonItem>
            );
          })}
        </IonGrid>
      </IonList>
      <IonCard>
        <IonRow>
          <IonCol size="8" sizeXs="4">
            <IonCardTitle class="ion-margin-start">
              <h1>Total</h1>
            </IonCardTitle>
          </IonCol>

          <IonCol></IonCol>
          <IonCol></IonCol>
          <IonCol class="ion-margin-end">
            <h1>{total.toFixed(2)}</h1>
          </IonCol>
        </IonRow>
      </IonCard>
        <IonRow class="cart_card ion-padding ion-justify-content-center">
        <button onClick={validateCart} className="btn41-43 btn-43 zzz_btn">Next</button>
        </IonRow>
    </IonContent>
  );
};

export default Cart;
