# Crypto / Stock Tracker (AlphaVantage) - Angular v20 scaffold

This project is an Angular v20+ single-page application for tracking stocks and cryptocurrencies using AlphaVantage.

## Setup

1. Clone or copy files into a directory.
2. Install dependencies:

    ```bash
    yarn install
    ```

3. Put your AlphaVantage API key in `src/environments/environment.ts` under `alphaVantageApiKey`.
4. ## Run Development server:

    ```bash
    yarn start
    ng serve
    ```
    Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.
5. ## Running unit tests:  

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

6. ## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.
