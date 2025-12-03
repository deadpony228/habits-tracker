<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>

      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="todo" href="/todo">
          <ion-icon :icon="listOutline" />
          <ion-label>Задачи</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="habits" href="/habits">
          <ion-icon :icon="checkboxOutline" />
          <ion-label>Привычки</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import { 
  IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel
} from '@ionic/vue';
import { listOutline, checkboxOutline } from 'ionicons/icons';
</script>
