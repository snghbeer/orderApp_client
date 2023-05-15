import { useEffect, useState } from 'react';

import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact, IonPage, } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';


import {SignupContainer, LoginContainer} from './components/session/LoginContainer';
import Dashboard from './components/Dashboard'; 
import Menu from './components/Menu';
import ProductManager from './components/ProductManager'; 
import AdminOrderPage from './components/AdminOrderPage'
import ProductDetailPage from './components/DetailedProductPage'

import {Header} from './components/Header'
import QRGen from './components/QRGenerator'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './components/theme/variables.css';
import './components/styles.css';

import { UserObject, UserPrivileges } from './components/interfaces/interfaces';
import {io} from 'socket.io-client';

import {ProtectedRoute, AdminRoute} from './routes/protectedRoute';
import { checkUserSessionCache } from './components/util/sqlQueries';
import { useStore, StorageContext } from "./components/storage";
import { serverUrl } from './config';
import { loginUser } from "./components/session/utils";
import {UserContext} from './components/util/SessionContext'

import DarkModeContext from './components/theme/DarkModeContext';
//import { isPlatform } from '@ionic/react';

setupIonicReact();

const App: React.FC = () => {
  const [activeSession, setActiveSession] = useState(false);
  const [gotNotif, setNotif] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const {connection, isReady} = useStore();
  const [aUser, setUser] = useState<UserObject | null>();
  const [tokenRefreshed, setTokenRefreshed] = useState(false);

  async function checkCache(){
    try{
      //if(await connection?.connection.isDBOpen()) await connection?.open()
      let ret = await connection?.execQuery(checkUserSessionCache)
      //await connection?.connection.close()
      let user = ret?.values![0]
      if(user) {
        setUser(user);
        setActiveSession(true)
        console.log(`Local user found: ${user.username}`);
      }
    }
    catch(err){
      console.error(err)
    }  
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
  };

  async function fetchUserSession(){
    const sock = io(serverUrl!)
    aUser!.socket = sock
    sock.on("connect", async() => {
      setActiveSession(true)
      if(aUser?.role === UserPrivileges.Admin) console.log("User is an admin")
      else if(aUser?.role === UserPrivileges.Manager) console.log('User is a manager')
      else console.log('User is not an admin')

      //handles real-time updates of orders
      sock.on("refresh", (data:any) => {
        if(aUser?.role === UserPrivileges.Admin || aUser?.role === UserPrivileges.Manager){
          console.log(data)
        }
      });
      return () => {
        sock.off("refresh");
        sock.disconnect();
      };
    })
    
  }
  useEffect(() => {
    if(isReady) checkCache()
   }, [isReady])

   useEffect(() => {
    if(aUser){
      fetchUserSession()
    }
    else setActiveSession(false)
   }, [aUser])


     useEffect(() => {
    if (activeSession && !tokenRefreshed) {
      const refreshToken = (newval: string) => {
        setUser((prevState) => ({ ...prevState!, token: newval }));
        setTokenRefreshed(true);
      };
      (async() => {
        const userCred = {
          username: aUser?.username!,
          password: aUser?.password!
        }
        await loginUser(userCred, (res) => {
          if (res.succes) {
            //console.log(`Old token: ${aUser?.token}`)
            refreshToken(res.token)
            //console.log(`New token: ${res.token}`)
          }else{
            console.log(res.message)
          }
        }); 
      })();
    }
  }, [activeSession, tokenRefreshed]);  
  
   useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if(isDarkMode) setIsDarkMode(true)
   }, [])

  return (
    <>
    <UserContext.Provider value={aUser}>
    <StorageContext.Provider value={{connection: connection, isReady: isReady}}>
      <IonApp className="scanner-hide">
          <DarkModeContext.Provider value={{isDarkMode, toggleDarkMode}}>
            {
              <IonPage id="main-content">
                <Header notified={gotNotif} user={aUser!}/>
                <IonReactRouter>
                  <IonSplitPane contentId="main">
                    <Menu db={connection!} active={activeSession} setActive={setActiveSession} user={aUser!} setUser={setUser} setNotif={setNotif}/>
                    <IonRouterOutlet id="main">

                        <Route path="/" component={() =>  !aUser ? Dashboard({active: activeSession,  setActive: setActiveSession}) : <Redirect to="/menu"/>}  exact={true} />
                        <Route path="/page/login" component={() => !aUser ? LoginContainer({db:connection!, setUser:setUser, active: activeSession, setActive: setActiveSession}) : <Redirect to="/menu"/> }  exact={true} />
                        <Route path="/page/signup" component={SignupContainer} exact={true}/>
                        <Route path="/menu"  exact={true} component={()=> ProductManager({connection: connection, isReady: isReady})}></Route>
                        <AdminRoute user={aUser!} path="/admin/orders" component={AdminOrderPage} />  
                        <ProtectedRoute storage={connection} isAuthenticated={activeSession} path="/qr" component={QRGen}/>  
                        <ProtectedRoute isAuthenticated={activeSession} path="/product/:id" component={ProductDetailPage}/> 

                    </IonRouterOutlet>
                  </IonSplitPane>
                </IonReactRouter>
              </IonPage>
          }
          </DarkModeContext.Provider>
      </IonApp>
    </StorageContext.Provider>
    </UserContext.Provider>

    </>
  );
};

/*    <div className="scanner-ui">
    </div> */

export default App;
