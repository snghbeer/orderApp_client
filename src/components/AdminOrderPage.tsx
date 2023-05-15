import { IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonRow, IonSpinner } from "@ionic/react"
import Page from "./pages/Page";

import "./styles.css";
import { useContext, useEffect, useState } from "react";
import { RecordDTO, UserPrivileges } from "./interfaces/interfaces";
import { DetailedRecordPage } from "./DetailedRecordModal";
import { apiUrl } from "../config";
import { checkmarkOutline, closeOutline } from "ionicons/icons";
import { UserContext } from "./util/SessionContext";
import { OrderController } from "./interfaces/controllers/OrderController";

const  AdminOrderPage = () => {
  //const [records, setRecords] = useState<RecordDTO[]>()
  const [selectedRecord, setRecord] = useState("");
  const [item, setItem] = useState<RecordDTO|undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const user = useContext(UserContext)
  const [orderController] = useState<OrderController>(new OrderController())


  async function fetchRecords() {
    const url = apiUrl + "/product_manager/records/all";
    const response = await fetch(url, {
      headers: { Authorization: "Bearer " + user?.token },
    });
    const data = await response.json();
    const orders = data.records
    //orders.sort((a:RecordDTO, b:RecordDTO) =>  new Date(b.date).getTime() - new Date(a.date).getTime()); //sort by most recent on top
    orderController.initOrders(orders)
    setIsLoading(false)
    //if(data.records.length > 0) setRecords(orders)
  }

  function openDetailedRecord(index: string){
    setRecord(index)
    const anOrder = orderController.getItem(index)
    setItem(anOrder)
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  //problem, logs twice
   useEffect(() => {
    if(user?.socket){
      user?.socket?.on("refresh", (data:any) => {
        //handles real-time updates of orders
        if(user?.role === UserPrivileges.Admin || user?.role === UserPrivileges.Manager){
          console.log(data)
        }
        return () => {
          user?.socket?.off("refresh"); //on unmount
          //user?.socket?.disconnect();
        };
      })
    }
  },[user?.socket]) 

    const content = (
        <IonContent class="ion-padding-top">
        <IonContent>
        <IonList inset>
        <IonGrid>
          <IonRow class="ion-padding">
            <IonCol size="10" sizeXs="2">
              <IonHeader>
                <b>Id</b>
              </IonHeader>
            </IonCol>
            <IonCol class="ion-text-center" sizeXs="3">
              <IonHeader>
                <b>Date</b>
              </IonHeader>
            </IonCol>
            <IonCol class="ion-text-end">
              <IonHeader class="ion-margin-start">
                <b>Waiter</b>
              </IonHeader>
            </IonCol>
            <IonCol class="ion-text-end">
              <IonHeader>
                <b>Closed</b>
              </IonHeader>
            </IonCol>
  
          </IonRow>
        </IonGrid>

        <IonGrid>
        { !isLoading ? 
          (orderController.toArray()!.map((record, index) => {
            return(
              <IonItem button key={record._id} onClick={() => openDetailedRecord(record._id)}>
              <IonCol size="8" sizeXs="2">
              <IonLabel>{record._id}</IonLabel>
              </IonCol>
              <IonCol class="ion-text-center" sizeXs="4">
              <IonLabel>{new Date(record.date).toLocaleString()}</IonLabel>
              </IonCol>
              <IonCol size="2" sizeXs="3" class="ion-text-end ">
              <IonLabel>{record?.waiter || "None"}</IonLabel>
              </IonCol>
              <IonCol class="ion-text-end">
              <IonIcon icon={false ? checkmarkOutline : closeOutline} size={window.innerWidth > 400 ? "large" : "small"}/>
              </IonCol>
              </IonItem>
            )
            })) : 
            (<IonRow class="ion-justify-content-center"><IonSpinner name="crescent"></IonSpinner></IonRow>)  
         }
        </IonGrid>
      </IonList>
        </IonContent>
        {
          item ? (<DetailedRecordPage
            _id={selectedRecord}
            date={item?.date}
            records={item?.records}
            total={item?.total}
            isOpen={isOpen}
            setOpen={setIsOpen}
            />) : <></>
        }
    </IonContent>
    )
    return <Page child={content} title="Orders" backUrl="/menu" />;

}

export default AdminOrderPage;
