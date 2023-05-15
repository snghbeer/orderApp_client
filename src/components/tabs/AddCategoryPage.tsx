import { useEffect, useState, useRef } from "react";
import {
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  useIonPicker,
  IonTextarea,
  IonToast,
  IonAlert,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./styles.css";

import { capitalizeFirstLetter, jsonToFormData } from "../util/helpFunctions";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  ProductProps,
  UpdatedProp,
  CategoryProps, ProductManagerProps, 
} from "../interfaces/interfaces";
import { image } from "ionicons/icons";
import { apiUrl } from "../../config";


const AddCategoryContainer = (props: UpdatedProp) => {
  const [name, setName] = useState("");

  async function addCategory() {
    const url = apiUrl + "/product_manager/category/new";
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + props.token,
      },
      body: JSON.stringify({ name: name }),
    };
    await fetch(url, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if(!data.error) props.setUpdated(true);
      })
      .catch((err) => console.log(err));
  }

  function handleInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    setName(input);
  }

  return (
    <>
      <IonList inset class="ion-padding">
        <IonItem class="item_btn">
          <IonLabel>
            <h1>Add a category</h1>
          </IonLabel>
        </IonItem>
        <IonItem fill="outline">
          <IonLabel position="floating">Category name</IonLabel>
          <IonInput
            onIonChange={(event) => handleInput(event)}
            placeholder="Enter something"
            value={name}
          ></IonInput>
        </IonItem>
        <IonItem class="ion-margin">
          <button className="btn41-43 btn-43" onClick={() => addCategory()}>
            Submit
          </button>
        </IonItem>
      </IonList>
    </>
  );
};

const AddCProductContainer = (props: UpdatedProp) => {
  const [showAlert, setShowAlert] = useState(false);
  const [category, setCategory] = useState("");
  const [present] = useIonPicker();
  const [addSuccess, setSuccess] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const values = useRef({
    file: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductProps>();

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
        },
        {
          text: "Confirm",
          handler: (value) => setCategory(value.categories.value),
        },
      ],
    });
  };

  const submitForm: SubmitHandler<ProductProps> = async (data) => {
    const url = apiUrl + "/product_manager/product/new";
    if (!values.current.file) {
      return false;
    }
    data.category = category;
    if (category === "") setShowAlert(true);
    else {
      //const jsonString = JSON.stringify(data);

      let formData = new FormData();
      formData.append("image", file!, file!.name);
      jsonToFormData(data, formData);

       try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + props.token,
          },
          body: formData,
        });
        if(response.ok) setSuccess(true)
      } catch (err) {
        console.log(err);
      } 
    }
  };

  const onFileChange = (fileChangeEvent: any) => {
    values.current.file = fileChangeEvent.target.files[0];
    setFile(fileChangeEvent.target.files[0]);
  };

  const customActionSheetOptions = {
    header: 'Categories',
    subHeader: 'Select a category'
  };

  return (
    <>
      <IonToast
        isOpen={addSuccess}
        position="top"
        message={"Product added successfully"!}
        onDidDismiss={() => setSuccess(false)}
        duration={2000}
        buttons={[
          {
            text: "Dismiss",
            role: "cancel",
          },
        ]}
      />

      <IonList inset class="ion-padding">
        <IonItem >
          <IonLabel>
            <h1>Add a product</h1>
          </IonLabel>
        </IonItem>
        <IonItem fill="outline" >
          <IonLabel position="floating">Product name</IonLabel>
          <IonInput {...register("name", { required: true })} />
          {errors.name && <p className="error_msg">Name is required</p>}
        </IonItem>

        <IonItem fill="outline">
          <IonLabel position="floating">Price</IonLabel>
          <IonInput
            type="number"
            step="0.01"
            min={0.01}
            {...register("price", { min: 0.01, required: true })}
          />
          {errors.price && <p className="error_msg">Price is required</p>}
        </IonItem>
        <IonItem fill="outline">
          <IonLabel position="floating">Description</IonLabel>
          <IonTextarea {...register("description", { required: true })} />
          {errors.description && (
            <p className="error_msg">Description is required</p>
          )}
        </IonItem>

        <IonItem fill="outline">
          <IonLabel position="floating">Amount</IonLabel>
          <IonInput
            type="number" min={0}
            {...register("quantity", { min: 0, required: true })}
          />
          {errors.quantity && <p className="error_msg">Amount is required</p>}
        </IonItem>

        <IonItem >
            <IonSelect {...register("category")} onIonChange={(ev) => setCategory(ev.target.value)} interfaceOptions={customActionSheetOptions} aria-label="category" placeholder="Select category" interface="alert">
              {props.categories!.map((category: CategoryProps, idx:number) => {
                return (
                  <IonSelectOption  key={idx} value={category.name}>{capitalizeFirstLetter(category.name)}</IonSelectOption>
              );
              })}
            </IonSelect>
        </IonItem>
        <IonItem>
          <div className="input-group mb-3">
            <input type="file" className="form-control" onChange={(ev) => onFileChange(ev)}/>
          </div>
        </IonItem>


        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Alert"
          message="Please select a category"
          buttons={["OK"]}
        />
        <IonItem class="ion-margin">
          <button
            className="btn41-43 btn-43"
            onClick={handleSubmit(submitForm)}
          >
            <b>Add</b>
          </button>
        </IonItem>
      </IonList>
    </>
  );
};

const InventoryContainer = (props: UpdatedProp) => {
//const [updated, setUpdated] = useState(false);

  const content = (
      <IonContent>
        <AddCategoryContainer updated={props.updated} setUpdated={props.setUpdated} token={props.token} />
        <AddCProductContainer updated={props.updated} categories={props.categories} setUpdated={props.setUpdated} token={props.token}  />
      </IonContent>
  );
  return content;
};

export default InventoryContainer;
