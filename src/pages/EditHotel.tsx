import React, { useContext, useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonLabel,
  IonInput,
  IonSpinner,
  IonItem
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";

import DatabaseContext from "../providers/DatabaseContext";
import { getHotelById } from "../hooks/getHotelById";
import { updateHotel } from "../hooks/updateHotel";
import { Hotel } from "../models/hotel";

const EditHotel: React.FC = () => {
  const { databaseService } = useContext(DatabaseContext)!;
  const { metadataId } = useParams<{ metadataId: string }>();
  const history = useHistory();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fields to update
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadHotel();
  }, [metadataId]);

  async function loadHotel() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const doc = await getHotelById(databaseService, metadataId);
      const data = doc as Hotel;
      setName(data.name || "");
      setDescription(data.description || "");
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!name) {
      setErrorMessage("Hotel name cannot be empty.");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      await updateHotel(databaseService, metadataId, {
        name,
        description
      });

      // Navigate back to /hotels
      history.push("/hotels");
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit Hotel</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.goBack()}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {isLoading ? (
          <div style={{ textAlign: "center", marginTop: "50%" }}>
            <IonSpinner />
          </div>
        ) : errorMessage ? (
          <IonLabel color="danger">{errorMessage}</IonLabel>
        ) : (
          <>
          <IonItem>
            <IonLabel position="stacked">Hotel Name</IonLabel>
              <IonInput
                type="text"
                value={name}
                onIonInput={(e) => setName(e.detail.value!)}
              />
          </IonItem>          
          <IonItem>
            <IonLabel position="stacked">Hotel Description</IonLabel>
              <IonInput
                type="text"
                value={description}
                onIonInput={(e) => setDescription(e.detail.value!)}
              />
          </IonItem>
            <IonButton expand="block" onClick={handleSave} style={{ marginTop: 12 }}>
              Save Changes
            </IonButton>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default EditHotel;