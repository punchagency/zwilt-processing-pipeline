const {Client} = require('@elastic/elasticsearch');

const elasticCloudID =
  'My_deployment:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDI1ZGY2MTdiNWRiZjRhMzBiMGM0YjJmMWZlODdmNGU5JGMyM2NmZTI5YThiYTQ4MDNhMTI0OWNhYWExMjRlMmM5';

const createElasticsearchClient = () => {
  const client = new Client({
    cloud: {
      id: elasticCloudID,
    },
    auth: {
      username: 'elastic',
      password: 'CPE9IAJ2EpeWLPRxqgDsL1Qs',
    },
  });

  return client;
};

export default createElasticsearchClient;
