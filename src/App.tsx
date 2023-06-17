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

import { ClientToServerEvents, ServerToClientEvents, UserObject, UserPrivileges } from './components/interfaces/interfaces';
import {Socket, io} from 'socket.io-client';

import {ProtectedRoute, AdminRoute} from './routes/protectedRoute';
import { checkUserSessionCache } from './components/util/sqlQueries';
import { useStore, StorageContext } from "./components/storage";
import { serverUrl } from './config';
import { loginUser } from "./components/session/utils";
import {UserContext} from './components/util/SessionContext'
import CheckoutForm from './components/Checkout';

import DarkModeContext from './components/theme/DarkModeContext';
//import { isPlatform } from '@ionic/react';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe, Stripe} from '@stripe/stripe-js';
import WebhookData from './components/interfaces/controllers/StripeController';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK!);


setupIonicReact();

const App: React.FC = () => {
  const [activeSession, setActiveSession] = useState(false);
  const [gotNotif, setNotif] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stripeInstance, setStripe] = useState<Stripe>()

  const {connection, isReady} = useStore();
  const [aUser, setUser] = useState<UserObject | null>();
  const [tokenRefreshed, setTokenRefreshed] = useState(false);
  const options = {
    // passing the client secret obtained from the server
    clientSecret:  process.env.REACT_APP_STRIPE_PK,
  };

  async function checkCache(){
    try{
      //if(await connection?.connection.isDBOpen()) await connection?.open()
      let ret = await connection?.execQuery(checkUserSessionCache)
      //await connection?.connection.close()
      let user = ret?.values![0]
      if(user) {
        const sock = io(serverUrl!,{
          query: { sessionId: 'hDXHgLq7IUb9ot5-AAAJ' },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        })
        user.socket = sock;
        setUser(user);
        setActiveSession(true)

        sock.on('connect', () => {
          //todo save session id in db/localStorage
          console.log(sock.id)
        })
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
    //const sock = io(serverUrl!)
    //setSocket(sock)
    //aUser!.socket = sock
    aUser?.socket?.on("connect", async() => {
      if(aUser?.role === UserPrivileges.Admin) console.log("User is an admin")
      else if(aUser?.role === UserPrivileges.Manager) console.log('User is a manager')
      else console.log('User is not an admin')

      return () => {
       aUser?.socket?.disconnect();
      };
    })
  }

  useEffect(() => {
    if(isReady) checkCache()
   }, [isReady])

   useEffect(() => {
    if(aUser?.socket){
      setActiveSession(true)
      fetchUserSession()
    }
    else setActiveSession(false)
   }, [aUser?.socket])


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

    useEffect(() => {
/*     (async() => {
      const stripePromise = await loadStripe(process.env.REACT_APP_STRIPE_PK!);
      setStripe(stripePromise!)
    })() */
   }, []) 

   const CheckoutEl = () => {
    return(<CheckoutForm />)
   }

   //                        

  return (
    <>
    <UserContext.Provider value={aUser}>
    <StorageContext.Provider value={{connection: connection, isReady: isReady}}>
      <IonApp className="scanner-hide">
          <DarkModeContext.Provider value={{isDarkMode, toggleDarkMode}}>
            {
              <IonPage id="main-content">
                <Header/>
                <IonReactRouter>
                  <IonSplitPane contentId="main">
                    <Menu db={connection!} active={activeSession} setActive={setActiveSession} user={aUser!} setUser={setUser} setNotif={setNotif}/>
                    <IonRouterOutlet id="main">

                        <Route path="/" component={() =>  !aUser ? Dashboard({active: activeSession,  setActive: setActiveSession}) : <Redirect to="/menu"/>}  exact={true} />
                        <Route path="/page/login" component={() => !aUser ? LoginContainer({db:connection!, setUser:setUser, active: activeSession, setActive: setActiveSession}) : <Redirect to="/menu"/> }  exact={true} />
                        <Route path="/page/signup" component={SignupContainer} exact={true}/>
                        <Route path="/menu"  exact={true} component={()=> ProductManager({connection: connection, isReady: isReady})}></Route>
                        <Route path="/checkout"  exact={true} component={CheckoutEl}></Route>
                        <Route path="/success"  exact={true} component={WebhookData}></Route>

                        <AdminRoute path="/admin/orders" component={AdminOrderPage} />  
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
