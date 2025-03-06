import 'react-native-url-polyfill/auto';
import { TextEncoder, TextDecoder } from 'text-encoding-polyfill';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (typeof crypto === 'undefined') {
  const crypto = require('crypto');
  global.crypto = {
    getRandomValues: (array) => {
      const bytes = crypto.randomBytes(array.length);
      array.set(bytes);
    }
  };
}