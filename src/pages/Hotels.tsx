import React, { useContext, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonLabel,
  IonList,
  IonItem,
  IonInput,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonButtons,
  IonSpinner,
  useIonViewWillEnter
} from "@ionic/react";
import { addOutline, closeOutline } from "ionicons/icons";

import { useHistory } from "react-router-dom";
import DatabaseContext from "../providers/DatabaseContext";
import { addHotel } from "../hooks/addHotel";
import { deleteHotel } from "../hooks/deleteHotel";
import useHotels from "../hooks/useHotels";
import { getHotels } from "../hooks/getHotels";

const Hotels: React.FC = () => {
  const { databaseService } = useContext(DatabaseContext)!;
  const history = useHistory();

  // const { hotels, error } = useHotels(databaseService);

  const [hotels, setHotels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newHotelName, setNewHotelName] = useState("");
  const [newHotelDescription, setNewHotelDescription] = useState("");

  useIonViewWillEnter(() => {
    loadHotels();
  });

  async function loadHotels() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getHotels(databaseService);
      setHotels(data || []);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddHotel() {
    if (!newHotelName || !newHotelDescription) {
      setErrorMessage("Please enter both a Hotel Name and Description.");
      return;
    }

    setErrorMessage("");
    try {
      await addHotel(databaseService, {
        name: newHotelName,
        description: newHotelDescription,
      });
      setNewHotelName("");
      setNewHotelDescription("");
      setShowModal(false);
      await loadHotels();
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  }

  // Use metadata_id for updating
  function goToEditHotel(metadataId: string) {
    history.push(`/hotels/edit/${metadataId}`);
  }

  async function handleDeleteHotel(hotel: any, metadataId: string) {
    try {
      setErrorMessage("");
      await deleteHotel(databaseService, hotel, metadataId);
      await loadHotels();
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Hotels</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        { isLoading ? 
          (
          <div style={{ textAlign: "center", marginTop: "50%" }}>
            <IonSpinner />
          </div>
          ) : errorMessage ? (
          <IonLabel color="danger" className="ion-padding">
            { errorMessage}
          </IonLabel>
        ) : hotels.length === 0 ? (
          <IonLabel className="ion-padding">No hotels found.</IonLabel>
        ) : (
          <IonList>
            {hotels.slice().reverse().
            map((doc: any) => (
              <IonCard key={doc.metadata_id} color="light">
                <IonCardHeader>
                  <IonCardTitle>{doc.name}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>{doc.description}</IonCardContent>
                <IonButton fill="clear" onClick={() => goToEditHotel(doc.metadata_id)}>
                  Edit
                </IonButton>
                <IonButton fill="clear" onClick={() => handleDeleteHotel(doc, doc.metadata_id)}>
                  Delete
                </IonButton>
              </IonCard>
            ))}
          </IonList>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowModal(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
              <IonTitle>Add New Hotel</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {errorMessage && (
              <IonLabel color="danger" className="ion-padding">
                {errorMessage}
              </IonLabel>
            )}
            <IonItem>
              <IonLabel position="stacked">Hotel Name</IonLabel>
              <IonInput
                type="text"
                value={newHotelName}
                onIonInput={(e) => setNewHotelName(e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Hotel Description</IonLabel>
              <IonInput
                type="text"
                value={newHotelDescription}
                onIonInput={(e) => setNewHotelDescription(e.detail.value!)}
              />
            </IonItem>
            <IonButton expand="block" onClick={handleAddHotel}>
              Insert New Hotel
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Hotels;