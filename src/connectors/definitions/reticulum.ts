import type { ServiceDefinition, ParameterDefinition, HealthCapability } from '../../types';
import { SERVICE_CATEGORIES } from '../../config/constants';
import { config } from '../../config/env';

// Reticulum network interface parameters
const networkParameters: ParameterDefinition[] = [
  {
    key: 'interface_type',
    label: 'Interface Type',
    type: 'select',
    defaultValue: 'tcp',
    options: [
      { value: 'tcp', label: 'TCP/IP' },
      { value: 'i2p', label: 'I2P Network' },
      { value: 'lora', label: 'LoRa Radio' },
      { value: 'packet_radio', label: 'Packet Radio' },
      { value: 'serial', label: 'Serial Interface' },
      { value: 'kiss', label: 'KISS Protocol' }
    ],
    description: 'The type of interface to use for Reticulum networking.'
  },
  {
    key: 'destination_name',
    label: 'Destination Name',
    type: 'string',
    defaultValue: 'kai_cd_node',
    description: 'Unique name for this Reticulum destination.'
  },
  {
    key: 'announce_rate',
    label: 'Announce Rate (seconds)',
    type: 'number',
    defaultValue: 360,
    range: [60, 3600],
    step: 60,
    description: 'How often to announce this destination on the network.'
  },
  {
    key: 'target_host',
    label: 'Target Host',
    type: 'string',
    defaultValue: 'amsterdam.connect.reticulum.network',
    description: 'Host to connect to (for TCP interfaces).',
    dependsOn: { interface_type: 'tcp' }
  },
  {
    key: 'target_port',
    label: 'Target Port',
    type: 'number',
    defaultValue: 4965,
    range: [1, 65535],
    description: 'Port to connect to (for TCP interfaces).',
    dependsOn: { interface_type: 'tcp' }
  },
  {
    key: 'i2p_peer',
    label: 'I2P Peer Address',
    type: 'string',
    defaultValue: 'g3br23bvx3lq5uddcsjii74xgmn6y5q325ovrkq2zw2wbzbqgbuq.b32.i2p',
    description: 'I2P destination address to connect to.',
    dependsOn: { interface_type: 'i2p' }
  },
  {
    key: 'lora_frequency',
    label: 'LoRa Frequency (MHz)',
    type: 'number',
    defaultValue: 915.0,
    step: 0.1,
    description: 'Operating frequency for LoRa radio.',
    dependsOn: { interface_type: 'lora' }
  },
  {
    key: 'lora_bandwidth',
    label: 'LoRa Bandwidth',
    type: 'select',
    defaultValue: '125',
    options: [
      { value: '7.8', label: '7.8 kHz' },
      { value: '10.4', label: '10.4 kHz' },
      { value: '15.6', label: '15.6 kHz' },
      { value: '20.8', label: '20.8 kHz' },
      { value: '31.25', label: '31.25 kHz' },
      { value: '41.7', label: '41.7 kHz' },
      { value: '62.5', label: '62.5 kHz' },
      { value: '125', label: '125 kHz' },
      { value: '250', label: '250 kHz' },
      { value: '500', label: '500 kHz' }
    ],
    description: 'LoRa signal bandwidth.',
    dependsOn: { interface_type: 'lora' }
  },
  {
    key: 'spreading_factor',
    label: 'Spreading Factor',
    type: 'number',
    defaultValue: 8,
    range: [7, 12],
    step: 1,
    description: 'LoRa spreading factor (7-12).',
    dependsOn: { interface_type: 'lora' }
  },
  {
    key: 'coding_rate',
    label: 'Coding Rate',
    type: 'select',
    defaultValue: '4/8',
    options: [
      { value: '4/5', label: '4/5' },
      { value: '4/6', label: '4/6' },
      { value: '4/7', label: '4/7' },
      { value: '4/8', label: '4/8' }
    ],
    description: 'LoRa error correction coding rate.',
    dependsOn: { interface_type: 'lora' }
  },
  {
    key: 'tx_power',
    label: 'TX Power (dBm)',
    type: 'number',
    defaultValue: 17,
    range: [5, 20],
    step: 1,
    description: 'Transmission power for radio interfaces.',
    dependsOn: { interface_type: ['lora', 'packet_radio'] }
  }
];

const healthCapability: HealthCapability = {
  capability: 'health',
  endpoints: {
    health: { path: '/status', method: 'GET' }
  }
};

// Reticulum mesh networking capability
const meshNetworkingCapability = {
  capability: 'mesh_networking',
  endpoints: {
    getNodes: { path: '/nodes', method: 'GET' },
    sendMessage: { path: '/message', method: 'POST' },
    getMessages: { path: '/messages', method: 'GET' },
    announce: { path: '/announce', method: 'POST' },
    getDestinations: { path: '/destinations', method: 'GET' }
  },
  parameters: {
    network: networkParameters
  }
};

export const reticulumDefinition: ServiceDefinition = {
  type: 'reticulum',
  name: 'Reticulum Network',
  category: SERVICE_CATEGORIES.NETWORKING,
  defaultPort: 37428, // RNS default management port
  docs: {
    main: 'https://reticulum.network/',
    api: 'https://markqvist.github.io/Reticulum/manual/',
    gui: 'https://unsigned.io/website/sideband/',
    meshchat: 'https://github.com/liamcottle/reticulum-meshchat'
  },
  authentication: {
    type: 'none' // Reticulum uses cryptographic identities, not traditional auth
  },
  configuration: {
    help: {
      title: 'Reticulum Setup',
      instructions: [
        'Reticulum is a cryptography-based networking stack for building unstoppable networks.',
        'Install Reticulum: pip install rns',
        'Configure interfaces in ~/.reticulum/config',
        'Use Sideband GUI: https://unsigned.io/website/sideband/',
        'For mesh chat: https://github.com/liamcottle/reticulum-meshchat',
        'Join testnet via TCP: amsterdam.connect.reticulum.network:4965'
      ].join('\n'),
      links: [
        { label: 'Official Website', url: 'https://reticulum.network/' },
        { label: 'Documentation', url: 'https://markqvist.github.io/Reticulum/manual/' },
        { label: 'GitHub Repository', url: 'https://github.com/markqvist/reticulum' },
        { label: 'Sideband GUI', url: 'https://unsigned.io/website/sideband/' },
        { label: 'MeshChat GUI', url: 'https://github.com/liamcottle/reticulum-meshchat' }
      ]
    },
    warnings: [
      'Reticulum is experimental software. Use caution in production environments.',
      'Radio interfaces require appropriate hardware and licensing.',
      'Testnet may contain experimental features and unstable behavior.'
    ]
  },
  capabilities: [meshNetworkingCapability, healthCapability]
}; 