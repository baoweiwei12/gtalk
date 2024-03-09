import os from 'os'
interface SendResponseOptions<T = any> {
  type: 'Success' | 'Fail'
  message?: string
  data?: T
}

export function sendResponse<T>(options: SendResponseOptions<T>) {
  if (options.type === 'Success') {
    return Promise.resolve({
      message: options.message ?? null,
      data: options.data ?? null,
      status: options.type,
    })
  }

  // eslint-disable-next-line prefer-promise-reject-errors
  return Promise.reject({
    message: options.message ?? 'Failed',
    data: options.data ?? null,
    status: options.type,
  })
}

export function getLocalIPAddresses() {
  const interfaces = os.networkInterfaces()
  const ipAddresses = []
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName]
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal)
        ipAddresses.push(address.address)
    }
  }
  return ipAddresses
}
