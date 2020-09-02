type Network = 'acala' | 'laminar'

const endpoints = {
  acala: [
    'wss://node-6684611760525328384.rz.onfinality.io/ws',
    'wss://node-6684611762228215808.jm.onfinality.io/ws',
    'wss://testnet-node-1.acala.laminar.one/ws'
  ],
  laminar: [
    'wss://node-6685729082874970112.jm.onfinality.io/ws',
    'wss://node-6685729080656576512.rz.onfinality.io/ws',
    'wss://testnet-node-1.laminar-chain.laminar.one/ws'
  ]
}

class Config {
  public getEndpints(network: Network) {
    const value = localStorage.getItem(network)
    if (!value) return endpoints[network]
    return JSON.parse(value) as string[]
  }

  public setEndpoints(network: Network, endpoints: string[]) {
    localStorage.setItem(network, JSON.stringify(endpoints))
  }

  public reset(network: Network) {
    localStorage.removeItem(network)
  }

}

export const config = new Config()
