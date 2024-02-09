const manualautomated=require('./Metrics/AutomatedManual.js')
const passfail=require('./Metrics/passfail.js')
const backlogtickets=require('./Metrics/backlog.js')
const openbugs=require('./Metrics/Jiraopenbugs.js')
const blockers=require('./Metrics/blockers.js')
const bugsperrelease=require('./Metrics/bugsperreleases.js')
const ticketsperrelease=require('./Metrics/ticketsperrelease.js')
module.exports={
    manualautomated,
    passfail,
    backlogtickets,
    openbugs,
    blockers,
    bugsperrelease,
    ticketsperrelease
    
}

