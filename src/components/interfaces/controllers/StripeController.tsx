import React, { useState, useEffect } from 'react';
import { IonContent, IonList, IonItem } from '@ionic/react';
import { PaySession } from '../PaymentInterface';


const PaymentSucces = () => {
  const [data, setData] = useState();

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/success')
      .then((response) => response.json())
      .then((data) => {
        console.log(data.session)
        const paySession:PaySession = data.session
        console.log(paySession.payment_status)
      });
  }, []);

  return (
    <IonContent>

    </IonContent>
  );
};

export default PaymentSucces;
