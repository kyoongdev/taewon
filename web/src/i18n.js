import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

function loadLocaleMessages() {
  const locales = require.context(
    "./locales",
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i
  );
  const messages = {};
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  return messages;
}

let lang = localStorage.getItem('locale')
if(!lang || lang === 'undefined' || lang === 'null') {
  lang = process.env.VUE_APP_BASE_I18N_LOCALE || "ko"
  localStorage.setItem('locale', lang)
}

export default new VueI18n({
  locale: lang,
  messages: loadLocaleMessages()
});
