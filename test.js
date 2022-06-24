const { Signale } = require('signale');


const l = new Signale({ interactive: false, scope: '1' });
const interactive = new Signale({ interactive: true, scope: 'interactive' });

const interactive2 = new Signale({ interactive: true, scope: 'interactive2' });

interactive.await('123123')

interactive.success('123123')

l.success('123')

interactive2.await('123123')

interactive2.success('123123')