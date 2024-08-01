import { isValidDate } from './js/date-checker';
import { handleAbout } from './js/about-handler';
import { handleSubmit } from './js/form-handler';
import * as typedefs from './js/typedefs';

// Webpack magic.
import './icons/logo.png';
import './images/no-image-available_1024x1024.png';
import './styles/resets.scss';
import './styles/base.scss';
import './styles/footer.scss';
import './styles/form.scss';
import './styles/header.scss';

// FIXME Disable Service Worker for the moment.
// if ('serviceWorker' in navigator) {
//   // See https://webpack.js.org/guides/progressive-web-application/#registering-our-service-worker.
//   console.log('Registering service worker...');
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/service-worker.js')
//       .then((registration) => {
//         console.log('SW registered: ', registration);
//       })
//       .catch((registrationError) => {
//         console.log('SW registration failed: ', registrationError);
//       });
//   });
// }

export { isValidDate, handleAbout, handleSubmit };
