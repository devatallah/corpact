import topups from './topups'
import settlements from './settlements'
import settlementItems from './settlement-items'
import commissionRates from './commission-rates'
import invoices from './invoices'
import terms from './terms'
import taxStatus from './tax-status'
import contractTerms from './contract-terms'

const finance = {
    topups: Object.assign(topups, topups),
    settlements: Object.assign(settlements, settlements),
    settlementItems: Object.assign(settlementItems, settlementItems),
    commissionRates: Object.assign(commissionRates, commissionRates),
    invoices: Object.assign(invoices, invoices),
    terms: Object.assign(terms, terms),
    taxStatus: Object.assign(taxStatus, taxStatus),
    contractTerms: Object.assign(contractTerms, contractTerms),
}

export default finance