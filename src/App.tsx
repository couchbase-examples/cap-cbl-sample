import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import DatabaseProvider from './providers/DatabaseProvider';
import Hotels from './pages/Hotels';
import EditHotel from './pages/EditHotel';

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

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <DatabaseProvider>
    <IonReactRouter>
        <IonRouterOutlet>        
          <Route exact path="/hotels">
            <Hotels />
          </Route>
          <Route exact path="/">
            <Redirect to="/hotels"/>
          </Route>
          <Route exact path="/hotels" component={Hotels} />
          <Route exact path="/hotels/edit/:metadataId" component={EditHotel} />
          <Route exact path="/" render={() => <Redirect to="/hotels" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </DatabaseProvider>
  </IonApp>
);

export default App;