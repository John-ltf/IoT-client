#run commands
npm start .env

#packages/commands for nodeJs
npx create-react-app client-iot --use-npm
npm install axios
npm install react-toastify
npm install semantic-ui-react
npm install @types/react@^17
npm install react-uuid
npm install dotenv
npm install @microsoft/signalr
npm install chart.js react-chartjs-2
npm install react-semantic-ui-datepickers
npm install date-fns
npm install @azure/msal-browser
npm install @azure/msal-react
npm install react-bootstrap
npm install rsuite
npm start .env

#commands to create SP,secrets for github workflows
az ad sp create-for-rbac --name $spName --role contributor --scopes /subscriptions/$subscriptionId/resourceGroups/$rg --sdk-auth
az keyvault set-policy -n $keyVaultName --secret-permissions get list --spn $clientId