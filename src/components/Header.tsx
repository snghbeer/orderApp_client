import {
  IonButtons,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonToolbar,
} from "@ionic/react";
import alertmenu from './assets/almenu.png'
import menu from './assets/menu.png'
import { NotificationHeader } from "./interfaces/interfaces";
import { useEffect, useState } from "react";
import { alertOutline, menuOutline } from "ionicons/icons";

export const Header = (props: NotificationHeader) => {
  const [getNotif, setNotifs] = useState(false)


  useEffect(() => {
    //update menu icon
    if(props?.user?.role === 0){
      props.user?.socket?.on("new_order", (data:any) => {
        setNotifs(true)
      });
      return () => {
        props.user?.socket?.disconnect(); 
      };
    }
  }, [props.user?.socket]);
  
  return (
    <IonHeader>
      <IonToolbar >
        <IonButtons slot="start">
          <IonMenuButton onClick={() => setNotifs(false)}>
          <IonIcon aria-hidden={true} color={!getNotif ? "dark" : "danger"} size="large" icon={menuOutline}>
            </IonIcon>
            {getNotif ?  <IonIcon aria-hidden={true} color={"danger"} icon={alertOutline}/> : <></>}
          </IonMenuButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};
