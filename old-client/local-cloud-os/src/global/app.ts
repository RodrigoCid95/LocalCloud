import { setupConfig, loadingController, modalController, pickerController, toastController } from '@ionic/core';
import { IEmmiters } from 'types/emmiters';
import { ICipher } from 'types/cipher';
import { IServerConnector } from 'types/server';
import { ITaskManager } from 'types/task-manager';

export default async () => {
  const localMode = localStorage.getItem('mode');
  let mode: 'ios' | 'md' = 'md';
  if (localMode && (localMode === 'ios' || localMode === 'md')) {
    mode = localMode;
  }
  setupConfig({
    mode
  });
  const { registerPlugin } = await import('@capacitor/core');
  registerPlugin<IEmmiters>('Emmiters', { web: () => import('./plugins/EventEmmiters').then(m => new m.Emmiters()) });
  registerPlugin<ICipher>('Cipher', { web: () => import('./plugins/Cipher').then(m => new m.Cipher()) });
  registerPlugin<IServerConnector>('ServerConnector', { web: () => import('./plugins/ServerConnector').then(m => new m.ServerConnector()) });
  registerPlugin<ITaskManager>('TaskManager', { web: () => import('./plugins/TaskManager').then(m => new m.TaskManager()) });
  (window as any).loadingController = loadingController;
  (window as any).modalController = modalController;
  (window as any).pickerController = pickerController;
  (window as any).toastController = toastController;
};