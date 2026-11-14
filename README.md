# MINI Körkoll

Mobilanpassad webbapp för familjens MINI. Start: 3 september 2026, körbudget 1 500 mil/år, utgångsvärde 2 400 km. Beräknar proportionell körbudget efter passerad tid, marginal i mil och prognos i årstakt.

## 1. Aktivera delad databas (Firebase, normalt gratis för små mängder data)

1. Gå till https://console.firebase.google.com och skapa ett Firebase-projekt.
2. Lägg till en webbapp (`</>`). Kopiera Firebase-konfigurationen till `firebase-config.js`, och ersätt `null` med objektet du får, t.ex. `window.MINI_FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", appId: "..." };`.
3. Öppna **Authentication → Sign-in method** och aktivera **Anonymous**.
4. Öppna **Firestore Database**, skapa en databas och välj region. Öppna fliken **Rules** och klistra in innehållet i `firestore.rules` och publicera reglerna. **Använd inte Firestores öppna testregler.**
5. I Firebase **Authentication → Settings → Authorized domains** kan du behöva lägga till din GitHub Pages-domän, t.ex. `anvandare.github.io` (om anonym inloggning blockeras av domänreglerna).

## 2. Publicera sidan med GitHub Pages

1. Skapa ett **nytt publikt repository** på GitHub, t.ex. `mini-korkoll`. **Lägg inte filerna i ett befintligt privat arbetsprojekt.**
2. Ladda upp `index.html`, `firebase-config.js`, `sync.js` till roten på repo. Ladda inte upp adminnycklar. Filen `firestore.rules` hör till Firebase-console och ska inte behöva vara publicerad, men är inte hemlig.
3. I GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → main / root → Save**.
4. Öppna adressen `https://DITT-GITHUB-NAMN.github.io/mini-korkoll/` i Safari. Vänta tills sidan visar **Synkroniserad · Gemensam mätarställning**.
5. Tryck **Dela körkoll** och skicka exakt samma URL, inklusive `#rum=...`, till din dotter. På varje iPhone: Safari → Dela → Lägg till på hemskärmen.

## Säkerhet och beteende

- Rums-ID är slumpat (128 bitar) och ligger efter `#rum=`. **Den som får länken kan läsa och ändra körsträckan** utan separat familjelösenord. Dela den privat.
- Högsta behörighet att läsa/ändra datat ges till varje anonymt Firebase-konto med den hemliga rumsadressen. Detta är ett enkelt familjeupplägg, inte en lösning för känsliga uppgifter.
- Om Firebase är nere eller inte aktiverat används enhetens lokala kopia och appen visar tydligt att den inte är synkroniserad. Ändringar som gjorts medan sidan är offline skickas **inte** automatiskt i efterhand; kontrollera siffran vid nästa uppkoppling.
- Ändringar från ena telefonen slår igenom på den andra när båda har nätåtkomst. Ingen persondata behövs.
- Om bilen hade mätarställning över 0 km vid leverans, ändra den under avtalsuppgifter.
- Datum använder telefonens lokala kalenderdag. Leasingbolaget kan debitera utifrån total körsträcka för hela avtalsperioden; dagliga tal är endast planeringsstöd.
