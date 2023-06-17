import { Storage } from "@ionic/storage";
import CartController from "./controllers/CartController";
import {Socket} from 'socket.io-client';
import { Route, RouteComponentProps } from "react-router";
import {MySQLiteDBConnection} from './controllers/Database'

export interface ActiveSessionProp {
  active?: boolean;
  setActive?: (active: boolean) => void;
  signout?: () => void;
  storage?: Storage;
  user?: UserObject;
  setUser?: (user: UserObject | null) => void;
  setNotif?:(active: boolean) => void;
  db?: MySQLiteDBConnection;
}

export interface ProtectedComponent extends Route, ActiveSessionProp {
  component: () => JSX.Element
}

export interface NotificationHeader{
  notified: boolean;
  user?: UserObject;

}

export type PageProps = {
  child: React.ReactNode,
  title?: string,
  backUrl?: string,
}

export interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

export interface LocationProp {
  locationPath: string;
}

export interface LogoutProp {
  setActive: (active: boolean) => void;
  signout: (storage:Storage) => void;
}

export interface DataObject{
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
  _id?: string;
}

export interface ProductDTO{
  id: string;
  isOpen: boolean;
  item: DataObject;
}

export interface DetailedPageProps {
  item: DataObject;
  image?: string;
  id?: string;
  isOpen: boolean;
  setClose?: (close: boolean) => void;
  setIsOpen?(): void;
  categories?: CategoryProps[];

  updated?: boolean;
  setUpdated?: (updated: boolean) => void;
}

export interface ProductManagerProps {
  categories?: CategoryProps[];
  items?: DetailedPageProps[];
  fetchItems?: () => void;
  fetchCats?: () => void;
}

export interface UpdatedProp extends ProductManagerProps{
  updated: boolean;
  setUpdated: (updated: boolean) => void;
  setItems?: (items: DetailedPageProps[]) => void;
  token?: string;

}

export interface CartPropItems extends ProductManagerProps{
  cart: CartController;
  setUpdated?: (updated: boolean) => void;
  updated?: boolean;
  user?: UserObject;
}

export interface CategoryProps {
  _id: string;
  name: string;
}

export type ProductProps = {
  name: string;
  category: string;
  description: string;
  quantity?: number;
  price?: number;
  image?: File;
};

export type RecordItem = {
  numberOfItems: number;
  product: DataObject;
  recordTotal: number;
}

export interface RecordDTO{
  _id: string;
  records: RecordItemDTO[];
  date: string;
  total: number;
  fulfilled?: boolean;
  isOpen?: boolean;
  setOpen?: (bool: boolean) => void;
  waiter?: string;
  validate?: () => void;
}

export type RecordItemDTO = {
  amount: number;
  price: number;
  product: string;
  _id?: string;
}


export  interface RecordItemInterface {
  numberOfItems: number;
  product: DataObject;
  recordTotal: number;
}

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  notif: (data: Buffer) => void;
  new_order: (data: OrderNotification) => void;
  refresh: (data: Buffer) => void;

}

export interface ClientToServerEvents {
  hello: () => void;
  new_order: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}

export enum UserPrivileges{
  Admin,
  Manager,
  User
}

export interface UserObject {
  username: string;
  email?: string;
  password?: string;
  cpassword?: string;
  role?: UserPrivileges;
  token?: string;
  socket?: Socket<ServerToClientEvents, ClientToServerEvents> | null | undefined;
  uid?: string;
}

export interface ProductDetailPageProps extends RouteComponentProps<{id: string;}> {}


///SQL Lite
export interface JsonListenerInterface {
  jsonListeners: boolean,
  setJsonListeners: React.Dispatch<React.SetStateAction<boolean>>,
}
export interface existingConnInterface {
  existConn: boolean,
  setExistConn: React.Dispatch<React.SetStateAction<boolean>>,
}

export interface SqliteDTO{
  id: number;
  json_data:string;
}

export interface StoreProps{
  connection: MySQLiteDBConnection | undefined | null;
  isReady: boolean |undefined | null;
}

export interface OrderNotification{
  id: string;
  message: string;
}
