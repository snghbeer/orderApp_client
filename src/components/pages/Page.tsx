import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar, IonBackButton
} from "@ionic/react";
//import { useParams } from "react-router";
import "./Page.css";
import React from "react";
import { PageProps } from "../interfaces/interfaces";

const Page: React.FC<PageProps> = (props: PageProps) => {
//  const { name } = useParams<{ name: string }>();




//TODO: MOVE header to app page, next TODO: HEADER OF app page make a seperate component?
  return (
    <IonPage >
      <IonHeader>
        <IonToolbar>
          <IonButtons>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen >
      <IonHeader>
        <IonToolbar>
          <IonTitle>{props.title}</IonTitle>

          <IonButtons slot="start">
            <IonBackButton defaultHref={props.backUrl}></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
          {props.child}
      </IonContent>
    </IonPage>
  );
};

export default Page;
