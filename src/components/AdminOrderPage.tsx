import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSpinner,
} from "@ionic/react";
import Page from "./pages/Page";

import "./styles.css";
import { useContext, useEffect, useState } from "react";
import { RecordDTO, UserPrivileges } from "./interfaces/interfaces";
import { DetailedRecordPage } from "./DetailedRecordModal";
import { apiUrl } from "../config";
import { checkmarkOutline, closeOutline } from "ionicons/icons";
import { UserContext } from "./util/SessionContext";
import { OrderController } from "./interfaces/controllers/OrderController";

const AdminOrderPage = () => {
  //const [records, setRecords] = useState<RecordDTO[]>()
  const [selectedRecord, setRecord] = useState("");
  const [item, setItem] = useState<RecordDTO | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updated, setUpdated] = useState(false);

  const user = useContext(UserContext);
  const [orderController] = useState<OrderController>(new OrderController());

  async function fetchRecords() {
    const url = `${apiUrl}/product_manager/records/all`;
    const response = await fetch(url, {
      headers: { Authorization: "Bearer " + user?.token },
    });
    const data = await response.json();
    const orders = data.records;
    //orders.sort((a:RecordDTO, b:RecordDTO) =>  new Date(b.date).getTime() - new Date(a.date).getTime()); //sort by most recent on top
    orderController.initOrders(orders);
    setIsLoading(false);
    //if(data.records.length > 0) setRecords(orders)
  }

  function openDetailedRecord(index: string) {
    setRecord(index);
    const anOrder = orderController.getItem(index);
    setItem(anOrder);
    setIsOpen(!isOpen);
  }

  async function takeOrder() {
    const temp = orderController.getItem(selectedRecord);
    if (!temp?.fulfilled && user) {
      const url = `${apiUrl}/product_manager/records/lock/${selectedRecord}`;
      const response = await fetch(url, {
        credentials: "include",
        headers: {
          Authorization: "Bearer " + user?.token,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          data: {
            user: user?.uid,
            name: user?.username,
          },
        }),
      });
      setIsOpen(!isOpen);
    } else await fetchRecords(); //just refresh data
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  //handles real-time updates of orders
  useEffect(() => {
     if (user?.role === UserPrivileges.Admin || user?.role === UserPrivileges.Manager) {
        user?.socket?.on("refresh", (data: any) => {
        //handles real-time updates of orders

        //close modal the selected order has already been taken by someone else
        if (isOpen && selectedRecord === data.order._id) setIsOpen(!isOpen);

        const update = {
          _id: data.order._id,
          records: data.order.records,
          date: data.order.date,
          total: data.order.total,
          waiter: data.order.waiter,
          fulfilled: data.order.fulfilled,
        };
        orderController.updateItem(data.order._id, update);
        setUpdated(!updated);
        return () => {
          user?.socket?.off("refresh"); //on unmount
        };
      });
    }
  }, [user?.socket, updated]);

  useEffect(() => {}, [updated]);

  const content = (
    <IonContent>
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
              <IonCol class="ion-text-center ion-padding-horizontal">
                <IonHeader>
                  <b>Waiter</b>
                </IonHeader>
              </IonCol>
              <IonCol size="auto" class="ion-text-end">
                <IonHeader>
                  <b>Closed</b>
                </IonHeader>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonGrid>
            {!isLoading ? (
              orderController.toArray()!.map((record, index) => {
                return (
                  <IonItem
                    button
                    key={record._id}
                    onClick={() => openDetailedRecord(record._id)}
                  >
                    <IonCol size="8" sizeXs="2">
                      <IonLabel>{record._id}</IonLabel>
                    </IonCol>
                    <IonCol class="ion-text-center" sizeXs="4">
                      <IonLabel>
                        {new Date(record.date).toLocaleString()}
                      </IonLabel>
                    </IonCol>
                    <IonCol
                      class="ion-text-center ion-padding-horizontal"
                      sizeXs="4"
                    >
                      <IonLabel class="ion-margin-start">
                        {record?.waiter || record?.waiter !== ""
                          ? record?.waiter
                          : "None"}
                      </IonLabel>
                    </IonCol>
                    <IonCol class="ion-text-end">
                      <IonIcon
                        icon={
                          record.fulfilled ? checkmarkOutline : closeOutline
                        }
                        size={window.innerWidth > 400 ? "large" : "small"}
                      />
                    </IonCol>
                  </IonItem>
                );
              })
            ) : (
              <IonRow class="ion-justify-content-center">
                <IonSpinner name="crescent"></IonSpinner>
              </IonRow>
            )}
          </IonGrid>
        </IonList>
      </IonContent>
      {item ? (
        <DetailedRecordPage
          _id={selectedRecord}
          date={item?.date}
          records={item?.records}
          total={item?.total}
          isOpen={isOpen}
          setOpen={setIsOpen}
          validate={takeOrder}
        />
      ) : (
        <></>
      )}
    </IonContent>
  );
  return <Page child={content} title="Orders" backUrl="/menu" />;
};

export default AdminOrderPage;
