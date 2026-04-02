import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EvernodeApi implements ICredentialType {
	name = 'evernodeApi';
	displayName = 'Evernode API';
	documentationUrl = 'https://docs.evernode.org/api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'API key for accessing Evernode services. Register on the Evernode platform to obtain your API key.',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.evernode.org/v1',
			required: true,
			description: 'Base URL for the Evernode API',
		},
	];
}