# E-Commerce Frontend

En enkel e-handelsfrontend byggd med React, TypeScript och Vite som konsumerar ditt befintliga API.

## 🚀 Funktioner

### Shop (Kundvy)

- **Hemsida** - Välkomstmeddelande och presentation
- **Produktkatalog** - Visa alla produkter från API:et
- **Produktdetaljer** - Detaljerad vy för varje produkt
- **Kundvagn** - Lägg till/ta bort produkter, uppdatera antal

### Admin

- **Produkthantering** - Skapa, redigera och ta bort produkter
- **Översikt** - Lista alla produkter i tabellformat

## 📋 Förutsättningar

1. **Backend API måste köra** på `http://localhost:3000`
2. **Node.js** installerat

## 🛠️ Komma igång

### 1. Starta backend API

```bash
cd ecommerce-api-new
npm run dev
```

### 2. Starta frontend

```bash
cd ecommerce-client/client
npm install  # Om du inte gjort det än
npm run dev
```

### 3. Öppna i webbläsare

Gå till `http://localhost:5173`

## 📱 Sidorna

| Sida          | URL            | Beskrivning          |
| ------------- | -------------- | -------------------- |
| Hem           | `/`            | Välkomstmeddelande   |
| Produkter     | `/products`    | Visa alla produkter  |
| Produktdetalj | `/product/:id` | Detaljerad produktvy |
| Kundvagn      | `/cart`        | Hantera kundvagn     |
| Admin         | `/admin`       | Produkthantering     |

## 💾 Datalagring

- **Kundvagn** sparas i localStorage
- **Produkter** hämtas från API:et
- **Admin-ändringar** skickas direkt till API:et

## 🎨 Design

- **Enkel CSS** utan externa bibliotek
- **Responsiv design** för mobil och desktop
- **Modern färgschema** med blå/grå toner
- **Användarvänligt gränssnitt**

## 🔧 API-endpoints som används

- `GET /products` - Hämta alla produkter
- `GET /products/:id` - Hämta en specifik produkt
- `POST /products` - Skapa ny produkt (admin)
- `PATCH /products/:id` - Uppdatera produkt (admin)
- `DELETE /products/:id` - Ta bort produkt (admin)

Appen är nu redo att användas! 🎉

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
