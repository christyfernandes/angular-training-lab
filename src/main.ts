import { registerLocaleData } from '@angular/common';
import localeHi from '@angular/common/locales/hi';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

// Locale data for date/number/currency pipes in Hindi. English (en-US) is built in.
registerLocaleData(localeHi);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
