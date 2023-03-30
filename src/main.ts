import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/main/app.module';
import { environment } from './environments/environment';

// fetch('/assets/config/appsettings.json').then(res => res.json()).then((resp) =>{
//     // platformBrowserDynamic().bootstrapModule(AppModule);
//     if (resp.production) {
//         enableProdMode();
//     }
//  })
if (environment.production) {
    enableProdMode();
  }

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
