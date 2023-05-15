import { useContext, useEffect, useState } from "react";
import {
  IonCol,
  IonList,
  useIonAlert,
  RefresherEventDetail,
  IonRefresher,
  IonRefresherContent, IonCard, IonGrid, IonRow, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonTitle, IonToolbar
} from "@ionic/react";

import { CartPropItems, DataObject, UserPrivileges } from "../interfaces/interfaces";
import { chevronDownCircleOutline } from "ionicons/icons";
import DarkModeContext from "../theme/DarkModeContext";
import CartContext from "../util/CartContext";
import useQueryParam from "../util/useQryParameters";


const MenuPage = (props: CartPropItems) => {
  const [presentAlert] = useIonAlert();
  const { isDarkMode } = useContext(DarkModeContext);
  //const { updated, setUpdated } = useContext(CartContext);

  //e.g. http://localhost:8100/menu?from=105&token=12345
  //we use query parameters to identify non-users that want to order
 // const [from] = useQueryParam('from', '');
 // const [token] = useQueryParam('token', '');


  function addToCart(aProduct: DataObject) {
    props.cart.addToCart(1, aProduct);
    props.setUpdated!(true)
    //setUpdated!()
  }

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    setTimeout(async () => {
      await props?.fetchCats!();
      await props?.fetchItems!();
      // Any calls to load data go here
      //await getItems();
      event.detail.complete();
    }, 1000);
  }
  useEffect(() => {
    //console.log(`Got: ${from} and ${token} as parameters`)
  },[])

  return (
    <IonContent>
      <IonList class="menulist ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="circles"
          />
        </IonRefresher>
        <IonGrid>
  <IonRow >
    {props.items?.map((item, idx) => (
        <IonCol key={idx} size="12" sizeXl="3" sizeLg="4" sizeMd="6" sizeSm="6" sizeXs="12" class="fadeIn"  style={{ animationDelay: `${idx/10}s` }} >
          <IonCard button class={isDarkMode ? "menu_card_dark" : "menu_card_light"}
            onClick={
            () => {
              presentAlert({
                cssClass:"custom-alert alert-button-inner",
                header: "Add to cart",
                buttons: [
                  {
                    text: "Yes",
                    role: "confirm",
                    handler: () => {
                      addToCart(props.items![idx]!.item);
                    },
                  },
                  {
                    text: "No",
                    role: "cancel",
                    handler: () => {
                      //  setHandlerMessage('Alert canceled!');
                    },
                  }
                ],
                
                //onDidDismiss: (e: CustomEvent) => setRoleMessage(`Dismissed with role: ${e.detail.role}`),
              });
            }
           }>
          <img src={item.item.image} alt="avatar" height={200} width={"100%"}/>
          <IonCardHeader>
            <IonCardTitle>{item.item.name}</IonCardTitle>
            <IonCardSubtitle>€ {(item.item.price).toFixed(2)}</IonCardSubtitle>
          </IonCardHeader>
        </IonCard>
        </IonCol>
  ))}
  </IonRow>
</IonGrid>

      </IonList>
    </IonContent>
  );
};

export default MenuPage;
