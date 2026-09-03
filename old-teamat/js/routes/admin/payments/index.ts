import failures from './failures'
import refunds from './refunds'

const payments = {
    failures: Object.assign(failures, failures),
    refunds: Object.assign(refunds, refunds),
}

export default payments