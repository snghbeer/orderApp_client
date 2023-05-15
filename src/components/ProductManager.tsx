import { useState, useEffect, useContext } from "react";
import {
  IonLabel,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonRouterOutlet,
  IonContent,
  IonPage,
  IonHeader,
  IonButtons,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Page from "./pages/Page";
import "./styles.css";
import { Route, Redirect } from "react-router";
import { IonReactRouter } from "@ionic/react-router";
import { ProtectedRoute, AdminRoute } from "../routes/protectedRoute";

import { home, library, bookSharp, cartSharp } from "ionicons/icons";

import HomePage from "./tabs/Inventory";
import MenuPage from "./tabs/ProductMenu";
import Cart from "./tabs/Cart";

import AddCategoryContainer from "./tabs/AddCategoryPage";
import {
  CategoryProps,
  DetailedPageProps,
  UserObject,
  SqliteDTO,
  DataObject,
  StoreProps,
  UserPrivileges,
} from "./interfaces/interfaces";
import CartController from "./interfaces/controllers/CartController";
import CartContext from "./util/CartContext";
import { Loader } from "./Loader";

import {
  insertProdsSessionQry2,
  getCategoriesSession,
  getProductsSession,
  insertCatsSessionnQry2,
} from "./util/sqlQueries";
import { apiUrl } from "../config";
import { UserContext } from "./util/SessionContext";

type ContentTypes = "menu" | "inventory" | "product_manager" | "cart";
const isAdmin = (user: UserObject) => user && (user.role === UserPrivileges.Admin || user.role === UserPrivileges.Manager);

//PROBLEM: SOMEHOW THIS PAGE DOESNT WANT TO RENDER

export default function ProductManager(store: StoreProps ) {
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [items, setItems] = useState<DetailedPageProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(false);
  const [cart] = useState<CartController>(new CartController());
  const [cartUpdated, setCartUpdated] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Menu');
  const user = useContext(UserContext)

  

  const contentHandler = (contentType: ContentTypes) => {
    switch (contentType) {
      case "inventory":
        return (
          <HomePage
            updated={updated}
            setUpdated={setUpdated}
            setItems={setItems}
            items={items}
            categories={categories}
            fetchItems={fetchItems}
          />
        );
      case "product_manager":
        return (
          <AddCategoryContainer
            updated={updated}
            setUpdated={setUpdated}
            items={items}
            categories={categories}
            token={user?.token}
          />

        );
      case "menu":
        return (
          <MenuPage
            categories={categories}
            items={items}
            cart={cart}
            setUpdated={setCartUpdated}
            updated={cartUpdated}
            fetchItems={fetchItems}
            fetchCats={fetchCategories}
          />

        );
      case "cart":
        return (
          <Cart
          items={items}
          categories={categories}
          cart={cart}
          setUpdated={setCartUpdated}
          updated={cartUpdated}
          user={user!}
        />

        );
      default:
        return null;
    }
  };

  async function fetchCategories() {
    const url = apiUrl + "/product_manager/category/all";
    const response = await fetch(url, {
      credentials: 'include',
      headers: { 
        Authorization: "Bearer " + user?.token,
        'Content-Type': 'application/json' 
      },
    });
    const data = await response.json();

     let jsonString = JSON.stringify(data.categories);
    let qry = insertCatsSessionnQry2(jsonString);
    await store.connection?.execQuery(qry); 
    setCategories(data.categories);
  }

  async function fetchItems() {
    await fetch(apiUrl + "/product_manager/product/all", {
      credentials: 'include',
      headers: { 
        Authorization: "Bearer " + user?.token,
        'Content-Type': 'application/json'
    },
    })
      .then((response) => response.json())
      .then(async (data) => {
        let prods: DataObject[] = data.products;
        const newItems: DetailedPageProps[] = [];
        for (let i = 0; i < prods.length; i++) {
          prods[i].description = prods[i].description.replace("'", "''");
          newItems.push({
            item: prods[i],
            isOpen: false,
            id: prods[i]._id,
          });
        }
        setItems(newItems);

        //storage
         let jsonString = JSON.stringify(newItems);
        let qry = insertProdsSessionQry2(jsonString);
        await store.connection?.execQuery(qry); 
        setLoading(false);
      })
      .catch((err) => console.log(err));
  }

  function updateCart() {
    setCartUpdated(!cartUpdated);
  }

  useEffect(() => {
    const checkCache = async () => {
      try {
        //await store.connection?.open()
         let cats: SqliteDTO = (
          await store.connection?.execQuery(getCategoriesSession)
        )?.values![0]; 
        let prods: SqliteDTO = (
          await store.connection?.execQuery(getProductsSession)
        )?.values![0]; 
        //await store.connection?.close()
         if (!cats)  fetchCategories();
        else setCategories(JSON.parse(cats.json_data));
        if (!prods)  fetchItems();
        else setItems(JSON.parse(prods.json_data)); 
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    if (store.isReady && store.connection) checkCache();
  }, [store.isReady, store.connection]);

   useEffect(() => {
    if (updated) {
      fetchCategories();
      fetchItems();
      setUpdated(false);
    }
  }, [updated]); 

  const renderContent = (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons></IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonHeader>
        <IonToolbar >
          <IonTitle >{selectedTab}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent >
          <CartContext.Provider
            value={{ updated: cartUpdated, setUpdated: updateCart }}
          >
            
            <IonReactRouter>
              <IonTabs onIonTabsDidChange={(event) => setSelectedTab(event.detail.tab)}>
                <IonRouterOutlet>
                  <AdminRoute
                    user={user!}
                    path="/product_manager"
                    exact={true}
                    component={() => contentHandler("product_manager")}
                  />
                  <AdminRoute
                    user={user!}
                    path="/inventory"
                    exact={true}
                    component={() => contentHandler("inventory")}
                  />
                  <Route
                    path="/cart"
                    render={() => contentHandler("cart")}
                    exact={true}
                  />
                  <Route
                    path="/menu"
                    render={() => contentHandler("menu")}
                    exact={true}
                  />
                </IonRouterOutlet>

                <IonTabBar slot="bottom" >
                  {isAdmin(user!) ? (
                    <IonTabButton
                      tab="Product manager"
                      href="/product_manager"
                    >
                      <IonIcon icon={home} />
                      <IonLabel>Product manager</IonLabel>
                    </IonTabButton>
                  ) : (
                    <></>
                  )}

                  {isAdmin(user!) ? (
                    <IonTabButton tab="Inventory" href="/inventory">
                      <IonIcon icon={library} />
                      <IonLabel>Inventory</IonLabel>
                    </IonTabButton>
                  ) : (
                    <></>
                  )}

                  <IonTabButton tab="Menu" href="/menu">
                    <IonIcon icon={bookSharp} />
                    <IonLabel>Menu</IonLabel>
                  </IonTabButton>
                  <IonTabButton tab="Cart" href="/cart">
                    <IonIcon icon={cartSharp} />
                    <IonLabel>Cart</IonLabel>
                  </IonTabButton>
                </IonTabBar>
              </IonTabs>
            </IonReactRouter>
          </CartContext.Provider>

      </IonContent>
    </IonPage>
  );

  return (
    <>
      {!loading ? (
        renderContent
      ) : (
        <Page child={<Loader />} />
      )}
    </>
  );
}

//export { AddProductForm, AddCategoryForm };
