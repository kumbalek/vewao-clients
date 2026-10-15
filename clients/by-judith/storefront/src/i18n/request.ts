import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async () => {
  // Czech only. The locale must be the BCP 47 code `cs` (not the URL's `cz`
  // country code), or ICU plurals fall back to English rules ("2 kusů").
  const locale = 'cs';

  return {
    locale,
    messages: (await import('../../messages/cz.json')).default
  };
});
