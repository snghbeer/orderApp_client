import { useEffect, useState } from "react";
import { PaymentElement } from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonItem,
  IonList,
  IonRow,
} from "@ionic/react";
import Page from "./pages/Page";
import { apiUrl } from "../config";
import { PaySession } from "./interfaces/PaymentInterface";


//const stripePromise = loadStripe('pk_test_51N1JFgIWoonMSFnMJnhIo98GVPQ02H2Ebm3fN8YUaJazrmnP5k1bvuHPGCFAELiMUBUVTF9Ntfp3ljnyyYcEF4K400fmnYXjkH');

const CheckoutForm = () => {
  const [openFrame, setOpen] = useState(false);
  const [checkoutUrl, setUrl] = useState();


  const fetchPaymentSession = async () => {
    await fetch(`${apiUrl}/create-checkout-session`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
      }).then((response) => response.json())
      .then(function (data) {
        console.log(data)
        setUrl(data.url)
        console.log(data.url)
        window.open(data.url, '_blank');
      })

    //setOpen(!openFrame)
  };

  function openNewWindow(url:string) {
    window.open(url, '_blank');
  }

  const checkPayment = async() =>{
    await fetch(`http://${process.env.REACT_APP_SERVER_URL}/api/v1/success`)
    .then((response) => response.json())
    .then((data:PaySession) => {
      console.log(data)
      console.log(data.payment_status)
    });
  }


  const options = {
    // passing the client secret obtained from the server
    clientSecret: "{{CLIENT_SECRET}}",
  };

  const content = (
    <IonContent>
      <IonCard>
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="auto">
              <IonItem class="ion-margin">
                <button
                  onClick={fetchPaymentSession}
                  style={{ maxWidth: "300px" }}
                  className="btn41-43 btn-43"
                >
                  Checkout
                </button>

                <button
                  onClick={checkPayment}
                  style={{ maxWidth: "300px" }}
                  className="btn41-43 btn-43"
                >
                  Check
                </button>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow >
          <IonCol class="ion-padding">
            {
                openFrame ? 
                (    <iframe className="iframe-container"
                    src={`${checkoutUrl ? checkoutUrl : ""}`}
                    width={ '100%'}
                    height={ '100%'}
                    title="Checkout"
                  ></iframe>) : <></>
              }
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCard>
    </IonContent>
  );

  return <Page child={content} title="Checkout" backUrl="/menu" />;
};

export default CheckoutForm;
