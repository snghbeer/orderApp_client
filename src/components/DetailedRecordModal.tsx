import { RecordDTO } from "./interfaces/interfaces";
import {
  IonButtons,
  IonButton,
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonSpinner,
  IonLabel,
  IonItem,
  IonCard,
  IonList,
  IonRow,
  IonCol,
} from "@ionic/react";
export const DetailedRecordPage = (props: RecordDTO) => {
  return (
    <IonModal isOpen={props.isOpen}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Details</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => props.setOpen!(false)}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {false ? (
          <>
            <IonSpinner name="crescent"></IonSpinner>
          </>
        ) : (
          <IonCard className="ion-padding ">
            <IonItem>
              <IonLabel>Id</IonLabel>
              <IonLabel>{props._id}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Ordered on</IonLabel>
              <IonLabel>{new Date(props.date).toLocaleString()}</IonLabel>
            </IonItem>
            <IonList class="recordList">
              <IonRow>
                <IonCol size="8" sizeXs="4">
                  <IonLabel>Products</IonLabel>
                </IonCol>
                <IonCol class="ion-text-end">
                  <IonLabel>Quantity</IonLabel>
                </IonCol>
                <IonCol class="ion-text-end">
                  <IonLabel>Price/u</IonLabel>
                </IonCol>
              </IonRow>
              {props.records.map((product, idx) => {
                return (
                  <IonItem key={idx}>
                    <IonCol size="8" sizeXs="4">
                      <IonLabel>{product.product}</IonLabel>
                    </IonCol>
                    <IonCol class="ion-text-end">
                      <IonLabel>{product.amount}</IonLabel>
                    </IonCol>
                    <IonCol class="ion-text-end">
                      <IonLabel>{product.price}</IonLabel>
                    </IonCol>
                  </IonItem>
                );
              })}
            </IonList>
            <IonItem>
                <IonLabel>Total</IonLabel>
                <IonLabel class="ion-text-end">{props.total}</IonLabel>
              </IonItem>
          </IonCard>
        )}
        <IonRow class="ion-float-right ion-margin-horizontal ion-justify-content-center ion-nowrap">
          <IonCol ><button className="btn41-43 btn-43 zzz_btn">Take</button></IonCol>
          <IonCol ><button onClick={props.validate} className="btn41-43 btn-43 zzz_btn">Validate</button></IonCol>
        </IonRow>
      </IonContent>
    </IonModal>
  );
};
