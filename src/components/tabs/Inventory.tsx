import { useState } from "react";
import {
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonRow,
  IonGrid,
  IonCol,
  IonSearchbar,
  SearchbarCustomEvent,
  IonContent,
} from "@ionic/react";
import { chevronDownCircleOutline } from "ionicons/icons";
import "../styles.css";
//import {capitalizeFirstLetter} from "../util/helpFunctions";

import { DetailedItemPage } from "./DetailedProductModal";
import { DetailedPageProps, UpdatedProp } from "../interfaces/interfaces";

const HomePage = (props: UpdatedProp) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [items, setItems] = useState<DetailedPageProps[]>(props.items!)


  function openDetailPage(index: number) {
    if (isOpen) setIsOpen(false);
    else {
      setSelectedItem(index);
      setIsOpen(true);
      //console.log(items[index])
    }
  }

/*
  async function getItems() {
    await fetch(serverUrl + "/product_manager/product/all", {
      headers: { Authorization: "Bearer " + cookies.user_session },
    })
    .then((response) => response.json())
    .then(async(data) => {
      const newItems: DetailedPageProps[] = [];
      for (let i = 1; i < data.products.length; i++) {
        data.products[i].description = data.products[i].description.replace("'", "''")
        newItems.push({
          item: data.products[i],
          isOpen: false,
          id: data.products[i]._id,
        });
      }
      props.setItems!(newItems);
      setItems(newItems)
      //storage
      let jsonString = JSON.stringify(newItems)
      let qry = insertProdsSessionQry2(jsonString)
      await storage?.execQuery(qry)              
    })
      
      .catch((err) => console.log(err));
  }
*/

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    setTimeout(async () => {
      // Any calls to load data go here
      props.fetchItems!()
      setItems(props.items!)
      event.detail.complete();
    }, 1000);
  }

  async function handleSearch(ev: SearchbarCustomEvent){
    ev.preventDefault()
    const search = props.items?.filter(item => item?.item.name.toLocaleLowerCase().startsWith(ev.target.value!.toLocaleLowerCase()))
    setItems(search!)
  }


  return (
    <IonContent>
      <IonList inset={true} class="m_top">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="circles"
          />
        </IonRefresher>
        <IonSearchbar onIonChange={handleSearch}></IonSearchbar>
        <IonGrid>
          <IonRow>
            <IonCol size="8" sizeXl="8" sizeLg="8" sizeMd="7" sizeSm="6" sizeXs="6">
              <h4>Product</h4>
            </IonCol>
            <IonCol class="ion-margin-start ion-text-center">
              <h4>Total</h4>
            </IonCol>
            <IonCol class="ion-text-end">
              <h4>Price</h4>
            </IonCol>
          </IonRow>
        </IonGrid>

        {items?.map((item, index) => {
          return (
            <IonItem
              key={index}
              className="inventory_items"
              button
              detail={false}
              onClick={() => openDetailPage(index)}
            >
              <IonAvatar slot="start">
                <img src={item.item.image} alt="avatar" />
              </IonAvatar>
              <IonCol size="8" sizeXl="8" sizeLg="8" sizeMd="7" sizeSm="6" sizeXs="6">
                <IonLabel>{item.item.name}</IonLabel>
              </IonCol>
              <IonCol size="2" sizeXs="2" class="ion-margin-start ion-text-center">
                <IonLabel>{item.item.quantity}</IonLabel>
              </IonCol>
              <IonCol class="ion-text-end">
                <IonLabel>{item.item.price.toFixed(2)}</IonLabel>
              </IonCol>
            </IonItem>
          );
        })}
      </IonList>
      <DetailedItemPage
        item={props.items![selectedItem]!.item}
        image={props.items![selectedItem]?.item.image}
        id={props.items![selectedItem]?.id}
        isOpen={isOpen}
        setClose={setIsOpen}
        setIsOpen={() => openDetailPage(selectedItem)}
        categories={props.categories}
        updated={props.updated}
        setUpdated={props.setUpdated}
      />
    </IonContent>
  );
};

export default HomePage;
