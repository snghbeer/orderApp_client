import React, { useContext } from 'react';
import DarkModeContext from './theme/DarkModeContext';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonToggle, IonToast, useIonToast 
} from "@ionic/react";

import { useLocation } from "react-router-dom";
import {
  homeOutline,
  homeSharp,
  fileTrayFull,
  fileTrayFullOutline,
  notifications,
  moonSharp,
  sunnySharp,
  qrCodeSharp
} from "ionicons/icons";
import "./Menu.css";

import {ActiveSessionProp, AppPage, UserPrivileges, OrderNotification} from './interfaces/interfaces';
import { useEffect, useState } from "react";
import { LogoutMenuItem, LoginMenuItem } from "./theme/MenuItem";
import { deleteUserSessionQry } from "./util/sqlQueries";
import { LocalNotifications } from '@capacitor/local-notifications';

import logo from './assets/logo.png'
import { apiUrl } from '../config';


const appPages: AppPage[] = [
  {
    title: "Dashboard",
    url: "/",
    iosIcon: homeOutline,
    mdIcon: homeSharp,
  },
  {
    title: "Menu",
    url: "/menu",
    iosIcon: fileTrayFull,
    mdIcon: fileTrayFullOutline,
  },
  {
    title: "QrTest",
    url: "/qr",
    iosIcon: qrCodeSharp,
    mdIcon: qrCodeSharp,
  },
];

const Menu = (props: ActiveSessionProp) => {
  const [notifs, setNotifs] = useState(0)
  const [showNotif, setShow] = useState(false)
  const [present] = useIonToast();
  const { toggleDarkMode, isDarkMode } = useContext(DarkModeContext);


  const location = useLocation();

  async function signOut () {
    //await props.storage!.set("user", null);
    await props.db?.execQuery(deleteUserSessionQry)
    const url = apiUrl + "/logout";
    const response = await fetch(url, {
      credentials: 'include',
      method: "POST",
      headers: { 
        Authorization: "Bearer " + props.user?.token,
      },
    });
    const data = await response.json();
    if(data){
      console.log(data)
      props?.setActive!(false)
      props?.setUser!(null);
    }
}


const presentToast = (msg: string) => {
  present({
    message: msg,
    duration: 1500,
    position: "top"
  });
}

const scheduleNotification = (data: OrderNotification) => {
  LocalNotifications.checkPermissions().then(async (result) => {
    if (result.display === "granted") {
      // permission granted
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `Order ${data.id}`,
            body: data.message,
            id: 1,
            summaryText: data.message
            
          },
        ],
      });
    } else {
      // permission not granted
      presentToast("You should enable permissions!")
      LocalNotifications.requestPermissions()
    }
  });
};

  useEffect(() => {
    if(props.active) console.log("User logged in")
    else console.log("User logged out")
  }, [props.active]) 
  

  useEffect(() => {
    props.user?.socket?.on("new_order", (data:OrderNotification) => {
      //console.log('Received data2:');
      console.log(data)
      if(props.user?.role  === UserPrivileges.Admin || props.user?.role  === UserPrivileges.Manager){
        setShow(true) //only notify admins or managers
        scheduleNotification(data)
        setNotifs((prev) => prev + 1)

      }
    });
    return () => {
      props.user?.socket?.disconnect(); // Disconnect the socket when the component unmounts
    };
  }, [props.user?.socket]);


  return (
    <>
       <IonToast
          cssClass="ion-text-center"
          isOpen={showNotif}
          position="top"
          message="New order received!"
          duration={3000}
          onDidDismiss={() => setShow(false)}
        />
    <IonMenu class="ion-margin-top" contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>
            <img src={logo} alt='logo' width={80} height={80} className='logoheader' />
          </IonListHeader>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={
                    location.pathname === appPage.url ? "selected" : ""
                  }
                  routerLink={appPage.url}
                  routerDirection="none"
                  lines="none"
                  detail={false}
                >
                  <IonIcon
                    slot="start"
                    ios={appPage.iosIcon}
                    md={appPage.mdIcon}
                  />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        {props.active ? (<LogoutMenuItem signout={signOut} />) : (<LoginMenuItem locationPath={location.pathname}/>)}
        </IonList>

        {
          (props.active && (props.user?.role === UserPrivileges.Admin || props.user?.role === UserPrivileges.Manager)) ?
          <>
          <IonList id="labels-list">
          <IonListHeader>Manager</IonListHeader>
          <IonItem lines="none" routerLink="/admin/orders" routerDirection="forward" detail={false}>
              <IonIcon slot="start" icon={notifications} />
              <IonLabel> Orders</IonLabel>
              <IonLabel class="ion-justify-end">{notifs}</IonLabel>
            </IonItem>
        </IonList>
        </> : <></>
        }
           <IonItem>
              <IonIcon icon={isDarkMode ? moonSharp : sunnySharp}></IonIcon>
            <IonToggle onIonChange={toggleDarkMode} checked={isDarkMode}></IonToggle>
            </IonItem>
      </IonContent>
    </IonMenu>
    </>
  );
};

export default Menu;
