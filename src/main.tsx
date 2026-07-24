import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

const amplifyConfig = {
  // Cognito / Auth
  aws_project_region: outputs.auth?.aws_region ?? outputs.data?.aws_region,
  aws_cognito_region: outputs.auth?.aws_region,
  aws_cognito_identity_pool_id: outputs.auth?.identity_pool_id,
  aws_user_pools_id: outputs.auth?.user_pool_id,
  aws_user_pools_web_client_id: outputs.auth?.user_pool_client_id,

  // AppSync / GraphQL
  aws_appsync_graphqlEndpoint: outputs.data?.url,
  aws_appsync_region: outputs.data?.aws_region,
  aws_appsync_authenticationType: outputs.data?.default_authorization_type || "API_KEY",
  aws_appsync_apiKey: outputs.data?.api_key,
};

Amplify.configure(amplifyConfig);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
