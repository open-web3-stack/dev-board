import { SubmittableExtrinsic } from '@polkadot/api/types'
import { notification } from 'antd'

const sendTx = (address: string, tx: SubmittableExtrinsic<'rxjs'>) => {
  const name = `${tx.method.section}.${tx.method.method}`
  tx.signAndSend(address).subscribe(result => {
    if (result.status.isReady) {
      notification.info({
        message: `Submit Transaction ${name}`,
        description: `Status: Ready`,
        duration: 2
      })
    }
    if (result.status.isInBlock) {
      const success = result.events.find(x => x.event.section === 'system' && x.event.method === 'ExtrinsicSuccess')
      const method = success ? 'success' : 'error'
      for (const evt of result.events) {
        notification[method]({
          message: `Submit Transaction ${name}`,
          description: `Event: ${evt.event.section}.${evt.event.method}(${evt.event.data.map(d => d.toHuman()).join(', ')})`,
          duration: 6
        })
      }
    }
  })
}

export default sendTx
