import {
  IonButtons,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonToolbar,
} from "@ionic/react";
//import { NotificationHeader } from "./interfaces/interfaces";
import {  menuOutline } from "ionicons/icons";

export const Header = () => {
  //const [getNotif, setNotifs] = useState(false)


/*   useEffect(() => {
    //update menu icon
    if(props?.user?.role === 0){
      props.user?.socket?.on("new_order", (data:any) => {
        setNotifs(true)
      });
      return () => {
        props.user?.socket?.disconnect(); 
      };
    }
  }, [props.user?.socket]); */
  
  return (
    <IonHeader>
      <IonToolbar >
        <IonButtons slot="start">
          <IonMenuButton>
          <IonIcon aria-hidden={true} size="large" icon={menuOutline}>
            </IonIcon>
          </IonMenuButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};
