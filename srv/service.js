const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    this.before('CREATE', 'ServiceOrder', async (req) => {
        const { ServiceOrder } = this.entities;
        const last = await SELECT.one
            .from(ServiceOrder)
            .columns('serviceOrderNumber')
            .orderBy('serviceOrderNumber desc');

        let next = 1;
        if (last?.serviceOrderNumber?.startsWith('SO-')) {
            const n = parseInt(last.serviceOrderNumber.slice(3), 10);
            if (!isNaN(n)) next = n + 1;
        }
        req.data.serviceOrderNumber = 'SO-' + String(next).padStart(6, '0');
    });
});
