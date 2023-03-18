const axios = require('axios');
const execSync = require('child_process').execSync;

require('dotenv').config();

const generatePostmanCollection = async (query, workspaceID) => {
	console.log(`Generating Postman collection for query: ${query}...`);

	const openaiApiKey = process.env.OPENAI_KEY;
	// const prompt = `in JS Create a Postman collection object in v2.1.0 to be used to create a postman collection using postman api with tests for the Postman Echo service using the OpenAPI schema`;
	// const prompt =
	// 	'create postman collection object v2.1.0 for postman echo service with tests';
	const apiUrl = `https://api.openai.com/v1/completions`;

	const response = await axios.post(
		apiUrl,
		{
			model: 'text-davinci-003',
			prompt: query,
			max_tokens: 1024,
			temperature: 0,
		},
		{
			headers: {
				Authorization: `Bearer ${openaiApiKey}`,
				'Content-Type': 'application/json',
			},
		}
	);

	const collection = response.data.choices[0].text;

	console.log(collection);

	// create postman-collection
	const postmanApiKey = process.env.POSTMAN_KEY;
	const postmanApiUrl = `https://api.getpostman.com/collections?workspace=${workspaceID}`;

	const { data } = await axios.post(
		postmanApiUrl,
		{
			collection: JSON.parse(collection),
		},
		{
			headers: {
				'Content-Type': 'application/json',
				'X-Api-Key': postmanApiKey,
			},
		}
	);

	return data;
};

// Call the generatePostmanCollection function with your desired query string
generatePostmanCollection(
	'create postman collection object v2.1.0 for postman echo service with tests',
	'e722b412-c666-43f5-b81e-58b934535f98'
)
	.then((data) => {
		// run the collection using postman-cli
		console.log('Collection is created. Running the collection...');
		execSync(`postman collection run ${data.collection.uid}`, {
			stdio: 'inherit',
		});
		console.log(
			`Collection run complete. Collection ID: ${data.collection.uid}`
		);
	})
	.catch((error) => console.error(error));
