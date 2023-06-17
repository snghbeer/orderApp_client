import { useEffect, useState, useRef, useContext } from "react";
import {
  IonButtons,
  IonButton,
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonAvatar,
  IonSpinner,
  IonLabel,
  IonItem,
  IonInput,
  IonCard,
  useIonPicker,
  useIonAlert,
} from "@ionic/react";
import { capitalizeFirstLetter, jsonToFormData } from "../util/helpFunctions";
import {
  DetailedPageProps,
  DataObject,
  ProductProps,
  CategoryProps,
} from "../interfaces/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import { apiUrl } from "../../config";
import { UserContext } from "../util/SessionContext";
const FILE_MAX_SIZE = 400000; //bytes~ 400kb

export const DetailedItemPage = (props: DetailedPageProps) => {
  const [loading, setLoading] = useState(true);
  //const [isOpen, setIsOpen] = useState(props.isOpen);
  const [data, setData] = useState<DataObject>();
  const [file, setFile] = useState<File | undefined>(undefined);
  const user = useContext(UserContext)
  const values = useRef({
    file: false,
  });
  const [presentAlert] = useIonAlert();
  const [present] = useIonPicker();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<ProductProps>();

  const onFileChange = (fileChangeEvent: any) => {
    let f = fileChangeEvent.target.files[0];
    if (f.size <= FILE_MAX_SIZE) {
      values.current.file = f;
      setFile(f);
    } else alert("File is too large");
  };

  const submitForm: SubmitHandler<ProductProps> = async (newData) => {
    const url = apiUrl + `/product_manager/product/${props.id}`;
    let formData = new FormData();

    if (values.current.file) {
      formData.append("image", file!, file!.name);
    }
    formData = jsonToFormData(newData, formData);

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + user?.token,
        },
        body: formData,
      });
      if(response.ok){
        props.setUpdated!(true)
      }
    } catch (err) {
      console.log(err);
    }
  };

  const openPicker = async () => {
    present({
      columns: [
        {
          name: "categories",
          options: props.categories!.map((category: CategoryProps) => {
            return {
              text: capitalizeFirstLetter(category.name),
              value: category.name,
            };
          }),
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "ion-float-left"
        },
        {
          text: "Confirm",
          handler: (value) => setValue("category", value.categories.value),
        },
      ],
    });
  };

  useEffect(() => {
    async function getData() {
      try {
        const item = props.item;
        setData({
          name: item.name,
          description: item.description,
          category: item.category,
          price: item.price,
          quantity: item.quantity,
        });
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    }
    if (props.isOpen) getData();
    if (!props.isOpen) setLoading(true);
  }, [props]);

  return (
    <IonModal isOpen={props.isOpen}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Details</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={props.setIsOpen}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <>
            <IonSpinner name="crescent"></IonSpinner>
          </>
        ) : (
          <IonCard className="ion-padding">
            <IonAvatar className="detailedPage_avatar ion-margin">
              <img src={props.image} alt="" />
            </IonAvatar>
            <IonLabel>
              <b>Name</b>
            </IonLabel>
            <IonInput
              placeholder={capitalizeFirstLetter(data?.name as string)}
              {...register("name")}
            />
            <IonLabel position="fixed">Description</IonLabel>
            <IonInput
              placeholder={data?.description}
              {...register("description")}
            />
            <IonLabel position="fixed">Total</IonLabel>
            <IonInput
              type="number"
              min={0}
              placeholder={data?.quantity.toString()}
              {...register("quantity")}
            />
            <IonLabel position="fixed">Price</IonLabel>
            <IonInput
              type="number"
              step="0.01"
              min={0.01}
              placeholder={data?.price.toString()}
              {...register("price")}
            />
            <button
              className="btn41-43 btn-43"
              onClick={openPicker}
              {...register("category")}
            >
              {watch("category")
                ? capitalizeFirstLetter(watch("category"))
                : "Category"}
            </button>
            <IonItem class="myItem">
              <div className="input-group mb-3">
            <input type="file" className="form-control" onChange={(ev) => onFileChange(ev)}/>
          </div>
            </IonItem>
            <button
              className="btn41-43 btn-43 btn-delete ion-margin-top" id="present-alert"
              onClick={() => {
                presentAlert({
                  cssClass:"custom-alert alert-button-inner",
                  header: "Are you sure?",
                  buttons: [
                    {
                      text: "Yes",
                      role: "confirm",
                      handler: () => {
                        console.log(`Deleting product: ${props.id}`)
                      },
                    },
                    {
                      text: "No",
                      role: "cancel",
                      handler: () => {
                        //  setHandlerMessage('Alert canceled!');
                      },
                    }
                  ],
                  
                });
              }}
            >
              <b>Delete</b>
            </button>
            <button
              className="btn41-43 btn-43  ion-margin-top"
              onClick={handleSubmit(submitForm)}
            >
              <b>Apply</b>
            </button>
          </IonCard>
        )}
        
      </IonContent>
    </IonModal>
  );
};
