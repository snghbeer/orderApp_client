import { IonCard, IonCardHeader, IonCardContent, IonSpinner } from "@ionic/react";
import Page from "./pages/Page";

export const Loader = () => {
    const loader = (
        <div className="spinner_centered" style={{ height: "70%"}}>
          <IonCard className="myspinner" >
            <IonCardHeader>
              {" "}
              <h3>Loading...</h3>
            </IonCardHeader>
            <IonCardContent>
              <IonSpinner></IonSpinner>
            </IonCardContent>
          </IonCard>
        </div>
      );
      return loader
}